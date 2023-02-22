import { injectable } from "tsyringe";
import SessionUseCaseError, {
  SessionUseCaseErrors,
} from "~modules/session/use-case/error";
import TokenDomain from "~modules/token/domain/token-domain";
import Token from "~modules/token/domain/value-objects/token";
import TokenType from "~modules/token/domain/value-objects/type";
import { TokenTypes } from "~modules/token/entity/Token";
import TokenMapper from "~modules/token/mappers/token-mapper";
import TokenRepository from "~services/database/typeorm/repositories/token-repository";
import UserRepository from "~services/database/typeorm/repositories/user-repository";
import EmailSender from "~services/email-sender/nodemailer";
import { Http } from "~services/webserver/types";
import { UseCase } from "~shared/core/use-case";
import DependencyInjection from "~shared/dependency-injection";
import { Either, Left, Right } from "~shared/either";
import DateHelper from "~shared/helpers/date";

type SendRecoverPasswordEmailParams = {
  userId: string;
  password: string;
};

type SendRecoverPasswordEmailResponse = Either<SessionUseCaseError, boolean>;

type PrepareEmailHtmlParams = {
  userName: string;
  recoverPasswordToken: string;
};

const RECOVER_PASSWORD_TYPE = "RECOVER_PASSWORD" as TokenTypes;
const TOKEN_DURATION = "1h";

@injectable()
export default class SendRecoverPasswordEmail
  implements
    UseCase<SendRecoverPasswordEmailParams, SendRecoverPasswordEmailResponse>
{
  private readonly userRepository: UserRepository;
  private readonly tokenRepository: TokenRepository;
  private readonly tokenMapper: TokenMapper;
  private readonly emailSender: EmailSender;
  private readonly subject: string;
  private readonly html: string;

  constructor(
    userRepository: UserRepository,
    emailSender: EmailSender,
    tokenRepository: TokenRepository,
    tokenMapper: TokenMapper
  ) {
    this.userRepository = userRepository;
    this.emailSender = emailSender;
    this.tokenRepository = tokenRepository;
    this.tokenMapper = tokenMapper;
    this.subject = "Recover Password - SSO App";
    this.html = `
      <!DOCTYPE html>
      <html lang="en">
      <body>
        <h1>
          Hi! {{name}}
        </h1>
        <p>
          Click on this link to recover your password from SSO App: {{link}}
        </p>
        <p>Note: you have 10 minutes to update your password with this link</p>
      </body>
      </html>
    `;
  }

  private prepareEmailHtml({
    userName,
    recoverPasswordToken,
  }: PrepareEmailHtmlParams): string {
    const clientLink = DependencyInjection.resolve("CLIENT_LINK");
    const authEmailLink = `<a href="${clientLink}/auth-email?token=${recoverPasswordToken}">Auth your email!</a>`;

    return this.html
      .replace("{{name}}", userName)
      .replace("{{link}}", authEmailLink);
  }

  public async execute(
    params: SendRecoverPasswordEmailParams
  ): Promise<SendRecoverPasswordEmailResponse> {
    const { userId, password } = params;

    const user = await this.userRepository.findOneById(userId);
    if (!user) {
      return new Left(
        new SessionUseCaseError(
          SessionUseCaseErrors.userIdNotFound(userId),
          Http.Status.BAD_REQUEST
        )
      );
    }

    const isPasswordCorrect = await user.password.comparePassword(password);
    if (!isPasswordCorrect) {
      return new Left(
        new SessionUseCaseError(
          SessionUseCaseErrors.invalidPassword,
          Http.Status.BAD_REQUEST
        )
      );
    }

    const tokenType = TokenType.create(RECOVER_PASSWORD_TYPE);
    if (tokenType.isLeft()) {
      return new Left(
        new SessionUseCaseError(
          SessionUseCaseErrors.invalidTokenType,
          Http.Status.INTERNAL_SERVER_ERROR
        )
      );
    }

    const recoverPasswordTokenOrError = Token.create(
      {
        userId,
        type: tokenType.value.value,
      },
      { expiresIn: TOKEN_DURATION }
    );
    if (recoverPasswordTokenOrError.isLeft()) {
      return new Left(
        new SessionUseCaseError(
          SessionUseCaseErrors.recoverPasswordTokenNotCreated,
          Http.Status.INTERNAL_SERVER_ERROR
        )
      );
    }

    const newToken = await TokenDomain.create({
      userId,
      type: tokenType.value,
      token: recoverPasswordTokenOrError.value,
      expiry: DateHelper.addHour(),
    });
    if (newToken.isLeft()) {
      return new Left(
        new SessionUseCaseError(
          SessionUseCaseErrors.invalidTokenProps(params),
          Http.Status.BAD_REQUEST
        )
      );
    }

    const tokenPersistence = await this.tokenMapper.toPersistence(
      newToken.value
    );

    const newTokenFromDb = await this.tokenRepository.create(tokenPersistence);
    if (newTokenFromDb.isLeft()) {
      const errorMessage = newTokenFromDb.value.message;
      if (errorMessage.includes("duplicated")) {
        return new Left(
          new SessionUseCaseError(
            SessionUseCaseErrors.duplicatedToken,
            Http.Status.BAD_REQUEST
          )
        );
      }

      return new Left(
        new SessionUseCaseError(
          SessionUseCaseErrors.couldNotCreateToken,
          Http.Status.INTERNAL_SERVER_ERROR
        )
      );
    }

    const emailHtml = this.prepareEmailHtml({
      userName: user.name.value,
      recoverPasswordToken: recoverPasswordTokenOrError.value.getDecryptValue(),
    });

    try {
      await this.emailSender.send({
        to: user.email.value,
        subject: this.subject,
        html: emailHtml,
      });
    } catch (err) {
      return new Left(
        new SessionUseCaseError(
          (err as Error).message,
          Http.Status.INTERNAL_SERVER_ERROR
        )
      );
    }

    return new Right(true);
  }
}
