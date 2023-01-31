import nodemailer, { Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { inject, injectable } from "tsyringe";
import {
  EmailSenderContract,
  EmailSendParams,
} from "~services/email-sender/contract";
import EmailSenderError from "~services/email-sender/error";

@injectable()
export default class EmailSender implements EmailSenderContract {
  private transporter: Transporter<SMTPTransport.SentMessageInfo>;

  constructor(
    @inject("EMAIL_SERVICE") private readonly emailService: string,
    @inject("EMAIL_SENDER") private readonly emailSender: string,
    @inject("EMAIL_PASSWORD") private readonly emailPassword: string
  ) {
    this.setup();
  }

  private setup(): void {
    this.transporter = nodemailer.createTransport({
      service: this.emailService,
      auth: {
        user: this.emailSender,
        pass: this.emailPassword,
      },
    });
  }

  public async send(params: EmailSendParams): Promise<void> {
    const { to, subject } = params;

    const mailOptions = {
      from: this.emailSender,
      to,
      subject,
      text: params.text || "",
      html: params.html || "",
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (err) {
      throw new EmailSenderError((err as Error).message, mailOptions);
    }
  }
}
