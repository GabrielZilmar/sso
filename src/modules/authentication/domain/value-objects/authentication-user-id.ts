import { validate } from "uuid";
import AuthenticationDomainError, {
  AuthenticationDomainErrors,
} from "~modules/authentication/domain/errors";
import { ValueObject } from "~shared/domain/value-object";
import { Either, Left, Right } from "~shared/either";

export interface AuthenticationUserIdProps {
  value: string;
}

export default class AuthenticationUserId extends ValueObject<AuthenticationUserIdProps> {
  private constructor(props: AuthenticationUserIdProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  private static isValid(value: string): boolean {
    return validate(value);
  }

  public static create(
    id: string
  ): Either<AuthenticationDomainError, AuthenticationUserId> {
    if (!this.isValid(id)) {
      return new Left(
        new AuthenticationDomainError(
          AuthenticationDomainErrors.invalidAuthenticationUserId
        )
      );
    }

    return new Right(new AuthenticationUserId({ value: id }));
  }
}
