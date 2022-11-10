import { UserDomainErrors } from "~modules/users/domain/errors";
import UserId from "~modules/users/domain/user-id";
import { AggregateRoot } from "~shared/domain/aggregate-root";
import { UniqueEntityID } from "~shared/domain/unique-entity-id";

export interface UserProps {
  email: string;
  name: string;
  password: string;
  isEmailVerified?: boolean;
  isAdminUser?: boolean;
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

  get isAdminUser(): boolean {
    return this.props.isAdminUser;
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

  public static create(props: UserProps, id?: UniqueEntityID): User {
    if (!this.isValid(props)) {
      throw new Error(UserDomainErrors.invalidUserProps);
    }

    const user = new User(
      {
        ...props,
        isDeleted: props.isDeleted || false,
        isEmailVerified: props.isEmailVerified || false,
        isAdminUser: props.isAdminUser || false,
      },
      id
    );

    return user;
  }
}
