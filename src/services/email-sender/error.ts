export default class EmailSenderError extends Error {
  public readonly payload: unknown;

  constructor(message: string, payload: unknown) {
    super(message);
    this.payload = payload;
    this.name = "email-sender";
  }
}
