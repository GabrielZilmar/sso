import { Entity } from "~shared/domain/entity";
import { UniqueEntityID } from "~shared/domain/unique-entity-id";

export default class UserId extends Entity<unknown> {
  get id(): UniqueEntityID {
    return this._id;
  }

  private constructor(id?: UniqueEntityID) {
    super(null, id);
  }

  // TODO: Implements Either
  public static create(id?: UniqueEntityID): UserId {
    return new UserId(id);
  }
}
