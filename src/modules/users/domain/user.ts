import UserId from "~modules/users/domain/user-id";
import { AggregateRoot } from "~shared/domain/aggregate-root";

export interface UserProps {
  email: string;
  password: string;
  name: string;
  isEmailVerified: boolean;
  isAdminUser: boolean;
  isDeleted: boolean;
  // TODO: Jwt tokens
}

export class User extends AggregateRoot<UserProps> {
  get userId(): UserId {
    return UserId.create(this._id);
  }
}
