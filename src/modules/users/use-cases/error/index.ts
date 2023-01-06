export const UserUseCaseErrors = {
  userNotFound: (id: string) => `Not found user with id "${id}"`,
};

export default class UserUseCaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "user-use-case";
  }
}
