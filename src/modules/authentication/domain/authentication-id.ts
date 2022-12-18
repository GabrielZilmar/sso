import { Entity } from "~shared/domain/entity";
import { UniqueEntityID } from "~shared/domain/unique-entity-id";

export default class AuthenticationId extends Entity<unknown> {
  get id(): UniqueEntityID {
    return this._id;
  }

  private constructor(id?: UniqueEntityID) {
    super(null, id);
  }

  public static create(id?: UniqueEntityID): AuthenticationId {
    return new AuthenticationId(id);
  }
}
