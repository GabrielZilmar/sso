export const AuthenticationUseCaseErrors = {
  userNotExits: (email: string) => `User with email "${email}" not exists.`,
  userIdNotFound: (id: string) => `Not found user with id "${id}"`,
  invalidPassword: "Invalid password. Try again.",
};

export default class AuthenticationUseCaseError extends Error {
  public readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "authentication-use-case";
  }
}
