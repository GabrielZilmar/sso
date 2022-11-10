import { UserDomainErrors } from "~modules/users/domain/errors";
import { ValueObject } from "~shared/domain/value-object";

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

  // TODO: implements an Either
  public static create(email: string): UserEmail {
    if (!this.isValid(email)) {
      throw new Error(UserDomainErrors.invalidEmail);
    }

    return new UserEmail({ value: this.format(email) });
  }
}
