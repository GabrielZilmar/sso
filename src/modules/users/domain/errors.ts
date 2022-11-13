export enum UserDomainErrors {
  invalidEmail = "Email address is not valid.",
  invalidPassword = "Invalid password. At least 6 characters are required",
  invalidName = "Invalid name. The name can contains only letters and digits, and at max 15 characters.",
  invalidUserProps = "Couldn't create the user. Invalid props",
}

export default class UserDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "user-domain";
  }
}
