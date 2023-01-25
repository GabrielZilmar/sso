import { injectable } from "tsyringe";
import AuthenticationUseCaseError, {
  AuthenticationUseCaseErrors,
} from "~modules/authentication/use-case/error";
import UserRepository from "~services/database/typeorm/repositories/user-repository";
import EmailSender from "~services/email-sender/nodemailer";
import { Http } from "~services/webserver/types";
import { UseCase } from "~shared/core/use-case";
import { Either, Left, Right } from "~shared/either";

type SendValidateEmailParams = {
  email: string;
};

type SendValidateEmailResponse = Either<AuthenticationUseCaseError, boolean>;

@injectable()
export default class SendValidateEmail
  implements UseCase<SendValidateEmailParams, SendValidateEmailResponse>
{
  private readonly userRepository: UserRepository;
  private readonly emailSender: EmailSender;
  private readonly subject: string;
  private readonly html: string;

  constructor(userRepository: UserRepository, emailSender: EmailSender) {
    this.userRepository = userRepository;
    this.emailSender = emailSender;
    this.subject = "Authenticate email on SSO App";
    this.html = `
      <!DOCTYPE html>
      <html lang="en">
      <body>
        <h1>
          Hi! {{Name}}
        </h1>
        <p>
          Click on this link to auth your email on SSO App: {{link}}
        </p>
      </body>
      </html>
    `;
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

    try {
      await this.emailSender.send({
        to: email,
        subject: this.subject,
        html: this.html,
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
