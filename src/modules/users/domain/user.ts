import UserDomainError, {
  UserDomainErrors,
} from "~modules/users/domain/errors";
import { UserCreatedEventPayload } from "~modules/users/domain/events-listeners/user-created";
import { UserDeletedEventPayload } from "~modules/users/domain/events-listeners/user-deleted";
import UserId from "~modules/users/domain/user-id";
import { AggregateRoot } from "~shared/domain/aggregate-root";
import { UniqueEntityID } from "~shared/domain/unique-entity-id";
import { Either, Left, Right } from "~shared/either";

export interface UserProps {
  email: string;
  name: string;
  password: string;
  isEmailVerified?: boolean;
  isAdmin?: boolean;
  isDeleted?: boolean;
  // TODO: Jwt tokens
}

export class User extends AggregateRoot<UserProps> {
  get userId(): UserId {
    return UserId.create(this._id);
  }

  get email(): string {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get password(): string {
    return this.props.password;
  }

  get isEmailVerified(): boolean {
    return this.props.isEmailVerified;
  }

  get isAdmin(): boolean {
    return this.props.isAdmin;
  }

  get isDeleted(): boolean {
    return this.props.isDeleted;
  }

  private constructor(props: UserProps, id?: UniqueEntityID) {
    super(props, id);
  }

  private static isValid(props: UserProps) {
    const { email, name, password } = props;

    return !!email && !!name && !!password;
  }

  public async delete(): Promise<void> {
    if (!this.props.isDeleted) {
      this.props.isDeleted = true;

      const eventPayload: UserDeletedEventPayload = {
        userId: this.userId,
        userEmail: this.email,
        deletedTime: new Date(),
      };
      await this.emitEvent("user.created", eventPayload);
    }
  }

  public static async create(
    props: UserProps,
    id?: UniqueEntityID
  ): Promise<Either<UserDomainError, User>> {
    if (!this.isValid(props)) {
      return new Left(new UserDomainError(UserDomainErrors.invalidUserProps));
    }

    const newUser = !id;

    const user = new User(
      {
        ...props,
        isDeleted: props.isDeleted || false,
        isEmailVerified: props.isEmailVerified || false,
        isAdmin: props.isAdmin || false,
      },
      id
    );

    if (newUser) {
      const eventPayload: UserCreatedEventPayload = { user };
      await user.emitEvent("user.created", eventPayload);
    }

    return new Right(user);
  }
}
