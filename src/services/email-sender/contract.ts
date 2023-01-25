export type EmailSendParams = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

export interface EmailSenderContract {
  send(params: EmailSendParams): Promise<void>;
}
