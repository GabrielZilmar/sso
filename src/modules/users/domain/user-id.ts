import { Entity } from "~shared/domain/entity";
import { UniqueEntityID } from "~shared/domain/unique-entity-id";

export default class UserId extends Entity<unknown> {
  get id(): UniqueEntityID | null {
    return this._id;
  }

  private constructor(id?: UniqueEntityID | null) {
    super(null, id);
  }

  public static create(id?: UniqueEntityID | null): UserId {
    return new UserId(id);
  }
}
