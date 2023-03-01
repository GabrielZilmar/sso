import UserDomainError, {
  UserDomainErrors,
} from "~modules/users/domain/errors";
import { ValueObject } from "~shared/domain/value-object";
import { Either, Left, Right } from "~shared/either";

export interface UserNameProps {
  value: string;
}

export default class UserName extends ValueObject<UserNameProps> {
  private static maxNameLength = 15;
  private static minNameLength = 4;

  private constructor(props: UserNameProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  private static isValid(name: string): boolean {
    const hasSpecialCharacterRegex = /[[:alnum:]]/;
    const isAppropriateLength =
      name.length <= this.maxNameLength && name.length >= this.minNameLength;

    return !hasSpecialCharacterRegex.test(name) && isAppropriateLength;
  }

  public static create(name: string): Either<UserDomainError, UserName> {
    if (!this.isValid(name)) {
      return new Left(new UserDomainError(UserDomainErrors.invalidName));
    }

    return new Right(new UserName({ value: name }));
  }
}
