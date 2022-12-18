import UserDomainError, {
  UserDomainErrors,
} from "~modules/users/domain/errors";
import { UserCreatedEventPayload } from "~modules/users/domain/events-listeners/user-created";
import { UserDeletedEventPayload } from "~modules/users/domain/events-listeners/user-deleted";
import UserId from "~modules/users/domain/user-id";
import UserEmail from "~modules/users/domain/value-objects/email";
import UserName from "~modules/users/domain/value-objects/name";
import UserPassword from "~modules/users/domain/value-objects/password";
import { AggregateRoot } from "~shared/domain/aggregate-root";
import { UniqueEntityID } from "~shared/domain/unique-entity-id";
import { Either, Left, Right } from "~shared/either";

export interface UserProps {
  email: UserEmail;
  name: UserName;
  password: UserPassword;
  isEmailVerified?: boolean;
  isAdmin?: boolean;
  deletedAt?: Date | null;
  // TODO: Jwt tokens
}

export class UserDomain extends AggregateRoot<UserProps> {
  get userId(): UserId {
    return UserId.create(this._id);
  }

  get email(): UserEmail {
    return this.props.email;
  }

  get name(): UserName {
    return this.props.name;
  }

  get password(): UserPassword {
    return this.props.password;
  }

  get isEmailVerified(): boolean {
    return this.props.isEmailVerified;
  }

  get isAdmin(): boolean {
    return this.props.isAdmin;
  }

  get isDeleted(): Date | null {
    return this.props.deletedAt;
  }

  private constructor(props: UserProps, id?: UniqueEntityID) {
    super(props, id);
  }

  private static isValid(props: UserProps) {
    const { email, name, password } = props;

    return !!email && !!name && !!password;
  }

  public async delete(): Promise<void> {
    if (!this.props.deletedAt) {
      this.props.deletedAt = new Date();

      const eventPayload: UserDeletedEventPayload = {
        userId: this.userId,
        userEmail: this.email.value,
        deletedTime: new Date(),
      };
      await this.emitEvent("user.created", eventPayload);
    }
  }

  public static async create(
    props: UserProps,
    id?: UniqueEntityID
  ): Promise<Either<UserDomainError, UserDomain>> {
    if (!this.isValid(props)) {
      return new Left(new UserDomainError(UserDomainErrors.invalidUserProps));
    }

    const isNewUser = !id;

    const user = new UserDomain(
      {
        ...props,
        deletedAt: props.deletedAt || null,
        isEmailVerified: props.isEmailVerified || false,
        isAdmin: props.isAdmin || false,
      },
      id
    );

    if (isNewUser) {
      const eventPayload: UserCreatedEventPayload = { user };
      await user.emitEvent("user.created", eventPayload);
    }

    return new Right(user);
  }
}
