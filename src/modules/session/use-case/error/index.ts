export const SessionUseCaseErrors = {
  userNotExits: (email: string) => `User with email "${email}" not exists.`,
  userIdNotFound: (id: string) => `Not found user with id "${id}"`,
  invalidTokenProps: (params: unknown) =>
    `Could not create token. Invalid props: ${JSON.stringify(params)}`,
  invalidPassword: "Invalid password. Try again.",
  invalidTokenType: "Invalid token type. Try again.",
  recoverPasswordTokenNotCreated: "Could not create Recover Password token",
  couldNotCreateToken: "Could not create token. Try again",
  duplicatedToken: "Duplicated token. Try again",
};

export default class SessionUseCaseError extends Error {
  public readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "session-use-case";
  }
}
