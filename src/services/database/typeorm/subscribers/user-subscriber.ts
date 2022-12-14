import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from "typeorm";
import UserPassword from "~modules/users/domain/value-objects/password";
import { User } from "~modules/users/entity/User";
import UserSubscriberError, {
  UserSubscriberErrors,
} from "~services/database/typeorm/subscribers/error/user-subscriber-error";

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }

  async beforeInsert({ entity }: InsertEvent<User>) {
    const { password: entityPassword } = entity;

    const passwordOrError = UserPassword.create(entityPassword);
    if (passwordOrError.isLeft()) {
      throw new UserSubscriberError(
        `${UserSubscriberErrors.invalidPassword}. ${passwordOrError.value.message}`,
        { password: entityPassword }
      );
    }

    const hashedPassword = await passwordOrError.value.getHashedValue();

    entity.password = hashedPassword;
  }
}
