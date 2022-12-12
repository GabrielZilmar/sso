import bcrypt from "bcrypt";
import UserDomainError, {
  UserDomainErrors,
} from "~modules/users/domain/errors";
import DependencyInjection from "~shared/dependency-injection";
import { ValueObject } from "~shared/domain/value-object";
import { Either, Left, Right } from "~shared/either";

export interface UserPasswordProps {
  value: string;
  isHashed?: boolean;
}

export default class UserPassword extends ValueObject<UserPasswordProps> {
  private static minPasswordLength = 6;

  private constructor(props: UserPasswordProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  private static isValid(password: string): boolean {
    return !!password && password.length >= this.minPasswordLength;
  }

  private async hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(
      password,
      DependencyInjection.resolve("PASSWORD_SALT")
    );

    return hash;
  }

  public isAlreadyHashed(): boolean {
    return this.props.isHashed;
  }

  public async getHashedValue(): Promise<string> {
    if (this.isAlreadyHashed) {
      return this.props.value;
    }

    const hashedValue = await this.hashPassword(this.props.value);
    return hashedValue;
  }

  public async comparePassword(plainTextPassword: string): Promise<boolean> {
    if (this.isAlreadyHashed()) {
      const isEqual = await bcrypt.compare(plainTextPassword, this.props.value);
      return isEqual;
    }

    return plainTextPassword === this.props.value;
  }

  public static create(
    password: string,
    isHashed = false
  ): Either<UserDomainError, UserPassword> {
    if (!this.isValid(password)) {
      return new Left(new Error(UserDomainErrors.invalidPassword));
    }

    return new Right(new UserPassword({ value: password, isHashed }));
  }
}
