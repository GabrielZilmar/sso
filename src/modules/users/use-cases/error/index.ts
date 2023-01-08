export const UserUseCaseErrors = {
  userNotFound: (id: string) => `Not found user with id "${id}"`,
  couldNotSaveUser: (id: string) => `Could not save the user. Payload: ${id}`,
  userIsAlreadyDeleted: (id: string) =>
    `Couldn't delete the user "${id}", it's is already deleted.`,
  invalidUserUpdateProps: (props: { name: string }) =>
    `Couldn't update user. Invalid user props: ${JSON.stringify(props)}.`,
  couldNotUpdateUser: "Something went wrong. Could not save the user.",
};

export default class UserUseCaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "user-use-case";
  }
}
