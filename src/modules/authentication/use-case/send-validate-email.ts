import { injectable } from "tsyringe";
import AuthenticationUseCaseError, {
  AuthenticationUseCaseErrors,
} from "~modules/authentication/use-case/error";
import UserRepository from "~services/database/typeorm/repositories/user-repository";
import EmailSender from "~services/email-sender/nodemailer";
import JwtService from "~services/jwt/jsonwebtoken";
import { Http } from "~services/webserver/types";
import { UseCase } from "~shared/core/use-case";
import DependencyInjection from "~shared/dependency-injection";
import { Either, Left, Right } from "~shared/either";

type SendValidateEmailParams = {
  email: string;
};

type SendValidateEmailResponse = Either<AuthenticationUseCaseError, boolean>;

type PrepareEmailHtmlParams = {
  userName: string;
  authEmailToken: string;
};

@injectable()
export default class SendValidateEmail
  implements UseCase<SendValidateEmailParams, SendValidateEmailResponse>
{
  private readonly userRepository: UserRepository;
  private readonly emailSender: EmailSender;
  private readonly jwtService: JwtService;
  private readonly subject: string;
  private readonly html: string;

  constructor(
    userRepository: UserRepository,
    emailSender: EmailSender,
    jwtService: JwtService
  ) {
    this.userRepository = userRepository;
    this.emailSender = emailSender;
    this.jwtService = jwtService;
    this.subject = "Authenticate email on SSO App";
    this.html = `
      <!DOCTYPE html>
      <html lang="en">
      <body>
        <h1>
          Hi! {{name}}
        </h1>
        <p>
          Click on this link to auth your email on SSO App: {{link}}
        </p>
      </body>
      </html>
    `;
  }

  private prepareEmailHtml({
    userName,
    authEmailToken,
  }: PrepareEmailHtmlParams): string {
    const clientLink = DependencyInjection.resolve("CLIENT_LINK");
    const authEmailLink = `<a href="${clientLink}/auth-email?token=${authEmailToken}">Auth your email!</a>`;

    return this.html
      .replace("{{name}}", userName)
      .replace("{{link}}", authEmailLink);
  }

  async execute(
    params: SendValidateEmailParams
  ): Promise<SendValidateEmailResponse> {
    const { email } = params;

    const user = await this.userRepository.findOneByCriteria({ email });
    if (!user) {
      return new Left(
        new AuthenticationUseCaseError(
          AuthenticationUseCaseErrors.userNotExits(email),
          Http.Status.BAD_REQUEST
        )
      );
    }

    const authEmailToken = this.jwtService.signToken({
      id: user.id.toString(),
      email: user.email.value,
      name: user.name.value,
    });

    const emailHtml = this.prepareEmailHtml({
      userName: user.name.value,
      authEmailToken,
    });

    try {
      await this.emailSender.send({
        to: email,
        subject: this.subject,
        html: emailHtml,
      });
    } catch (err) {
      return new Left(
        new AuthenticationUseCaseError(
          (err as Error).message,
          Http.Status.INTERNAL_SERVER_ERROR
        )
      );
    }

    return new Right(true);
  }
}
