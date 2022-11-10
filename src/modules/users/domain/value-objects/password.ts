import bcrypt from "bcrypt";
import config from "~config/config";
import { UserDomainErrors } from "~modules/users/domain/errors";
import { ValueObject } from "~shared/domain/value-object";

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
    const hash = await bcrypt.hash(password, config.passwordSalt);

    return hash;
  }

  public async comparePassword(plainTextPassword: string): Promise<boolean> {
    const passwordHashed = this.props.value;

    const isEqual = await bcrypt.compare(plainTextPassword, passwordHashed);
    return isEqual;
  }

  public static async create(password: string): Promise<UserPassword> {
    if (!this.isValid(password)) {
      throw new Error(UserDomainErrors.invalidPassword);
    }

    const hashedPassword = await this.hashPassword(password);
    return new UserPassword({ value: hashedPassword });
  }
}
