import { injectable } from "tsyringe";
import SessionUseCaseError, {
  SessionUseCaseErrors,
} from "~modules/session/use-case/error";
import UserRepository from "~services/database/typeorm/repositories/user-repository";
import EmailSender from "~services/email-sender/nodemailer";
import JwtService from "~services/jwt/jsonwebtoken";
import { Http } from "~services/webserver/types";
import { UseCase } from "~shared/core/use-case";
import { Either, Left, Right } from "~shared/either";

type SendRecoverPasswordEmailParams = {
  userId: string;
  password: string;
};

type SendRecoverPasswordEmailResponse = Either<SessionUseCaseError, boolean>;

@injectable()
export default class SendRecoverPasswordEmail
  implements
    UseCase<SendRecoverPasswordEmailParams, SendRecoverPasswordEmailResponse>
{
  private readonly userRepository: UserRepository;
  private readonly emailSender: EmailSender;
  private readonly jwtService: JwtService;

  constructor(
    userRepository: UserRepository,
    emailSender: EmailSender,
    jwtService: JwtService
  ) {
    this.userRepository = userRepository;
    this.emailSender = emailSender;
    this.jwtService = jwtService;
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

    // TODO: Create recover password token
    // TODO: Send recover password email

    return new Right(true);
  }
}
