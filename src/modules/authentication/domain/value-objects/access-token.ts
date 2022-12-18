import AuthenticationDomainError, {
  AuthenticationDomainErrors,
} from "~modules/authentication/domain/errors";
import JwtService from "~services/jwt/jsonwebtoken";
import DependencyInjection from "~shared/dependency-injection";
import { ValueObject } from "~shared/domain/value-object";
import { Either, Left, Right } from "~shared/either";

export interface AccessTokenProps {
  value: string;
  isAuth?: boolean;
}

export default class AccessToken extends ValueObject<AccessTokenProps> {
  private constructor(props: AccessTokenProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  get isAuth(): boolean {
    return this.props.isAuth;
  }

  private static isValid(value: string): boolean {
    const jwt = DependencyInjection.resolve(JwtService);

    if (jwt.isTokenExpired(value)) {
      return true;
    }

    return jwt.isValidToken(value);
  }

  public static create(
    token: string
  ): Either<AuthenticationDomainError, AccessToken> {
    if (!this.isValid(token)) {
      return new Left(
        new AuthenticationDomainError(
          AuthenticationDomainErrors.invalidAuthenticationAccessToken
        )
      );
    }

    const jwt = DependencyInjection.resolve(JwtService);
    const isAuth = !jwt.isTokenExpired(token);

    return new Right(new AccessToken({ value: token, isAuth }));
  }
}
