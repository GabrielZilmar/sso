import { UserDomainErrors } from "~modules/users/domain/errors";
import { ValueObject } from "~shared/domain/value-object";

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

    return hasSpecialCharacterRegex.test(name) && isAppropriateLength;
  }

  public static create(name: string): UserName {
    if (!this.isValid(name)) {
      throw new Error(UserDomainErrors.invalidPassword);
    }

    return new UserName({ value: name });
  }
}
