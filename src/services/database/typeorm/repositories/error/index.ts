export enum RepositoryErrors {
  createError = "Could not create the item.",
  updateError = "Could not update the item.",
  itemNotFound = "Item not found.",
  itemDuplicated = "Item is duplicated.",
  deleteError = "Could not delete the item.",
  saveError = "Could not save the items.",
  itemAlreadyExists = "Item Already exists.",
}

export default class RepositoryError extends Error {
  public readonly payload?: unknown;

  constructor(message: string, payload?: unknown) {
    super(message);
    this.payload = payload || null;
    this.name = "repository-base";
  }
}
