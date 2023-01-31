export const UserUseCaseErrors = {
  userNotFound: (id: string) => `Not found user with id "${id}"`,
  couldNotSaveUser: (id: string) => `Could not save the user. Payload: ${id}`,
  userIsAlreadyDeleted: (id: string) =>
    `Couldn't delete the user "${id}", it's is already deleted.`,
  invalidUserProps: (props: { [key: string]: string }) =>
    `Couldn't save user. Invalid user props: ${JSON.stringify(props)}.`,
  couldNotUpdateUser: "Something went wrong. Could not save the user.",
  couldNotCreateUser: "Something went wrong. Could not create the user.",
  duplicatedUserEmail: (email: string) => `Email "${email}" is already taken`,
  duplicatedUserName: (username: string) =>
    `Username "${username}" is already taken`,
};

export default class UserUseCaseError extends Error {
  public readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "user-use-case";
  }
}
