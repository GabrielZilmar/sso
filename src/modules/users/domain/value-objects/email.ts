import UserDomainError, {
  UserDomainErrors,
} from "~modules/users/domain/errors";
import { ValueObject } from "~shared/domain/value-object";
import { Either, Left, Right } from "~shared/either";

export interface UserEmailProps {
  value: string;
}

export default class UserEmail extends ValueObject<UserEmailProps> {
  private constructor(props: UserEmailProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  private static isValid(email: string) {
    const isEmailRegex =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return isEmailRegex.test(email);
  }

  private static format(email: string): string {
    return email.trim().toLowerCase();
  }

  public static create(email: string): Either<UserDomainError, UserEmail> {
    if (!this.isValid(email)) {
      return new Left(new UserDomainError(UserDomainErrors.invalidEmail));
    }

    return new Right(new UserEmail({ value: this.format(email) }));
  }
}
