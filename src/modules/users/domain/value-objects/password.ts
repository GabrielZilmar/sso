import bcrypt from "bcrypt";
import UserDomainError, {
  UserDomainErrors,
} from "~modules/users/domain/errors";
import DependencyInjection from "~shared/dependency-injection";
import { ValueObject } from "~shared/domain/value-object";
import { Either, Left, Right } from "~shared/either";

export interface UserPasswordProps {
  value: string;
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
    return !password || password.length < this.minPasswordLength;
  }

  private static async hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(
      password,
      DependencyInjection.resolve("PASSWORD_SALT")
    );

    return hash;
  }

  public async comparePassword(plainTextPassword: string): Promise<boolean> {
    const passwordHashed = this.props.value;

    const isEqual = await bcrypt.compare(plainTextPassword, passwordHashed);
    return isEqual;
  }

  public static async create(
    password: string
  ): Promise<Either<UserDomainError, UserPassword>> {
    if (!this.isValid(password)) {
      return new Left(new Error(UserDomainErrors.invalidPassword));
    }

    const hashedPassword = await this.hashPassword(password);
    return new Right(new UserPassword({ value: hashedPassword }));
  }
}
