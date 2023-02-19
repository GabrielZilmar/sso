import TokenDomainError, {
  TokenDomainErrors,
} from "~modules/token/domain/errors";
import JwtService from "~services/jwt/jsonwebtoken";
import DependencyInjection from "~shared/dependency-injection";
import { ValueObject } from "~shared/domain/value-object";
import { Either, Left, Right } from "~shared/either";

export interface TokenProps {
  value: string;
  isAuth?: boolean;
}

export default class Token extends ValueObject<TokenProps> {
  private constructor(props: TokenProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  get isAuth(): boolean {
    const jwt = DependencyInjection.resolve(JwtService);

    const isExpired = jwt.isTokenExpired(this.props.value);
    this.props.isAuth = isExpired;

    return this.props.isAuth;
  }

  public getDecodedValue<T>(): T | null {
    const jwt = DependencyInjection.resolve(JwtService);

    return jwt.decodeToken(this.props.value) as T | null;
  }

  private static isValid<T>(props: T): boolean {
    const isValidObject =
      !!props && typeof props === "object" && !Array.isArray(props);

    return isValidObject;
  }

  public static create<T>(props: T): Either<TokenDomainError, Token> {
    if (!this.isValid<T>(props)) {
      return new Left(new TokenDomainError(TokenDomainErrors.invalidToken));
    }

    const jwt = DependencyInjection.resolve(JwtService);

    const token = jwt.signToken(props);
    const isAuth = !jwt.isTokenExpired(token);

    return new Right(new Token({ value: token, isAuth }));
  }
}
