export enum UserSubscriberErrors {
  invalidPassword = "Could not create the user, invalid password",
}

export default class UserSubscriberError extends Error {
  public readonly payload?: unknown;

  constructor(message: string, payload?: unknown) {
    super(message);
    this.payload = payload || null;
    this.name = "user-subscriber";
  }
}
