import TokenDomainError, {
  TokenDomainErrors,
} from "~modules/token/domain/errors";
import Crypto from "~services/cryptography/crypto";
import JwtService from "~services/jwt/jsonwebtoken";
import DependencyInjection from "~shared/dependency-injection";
import { ValueObject } from "~shared/domain/value-object";
import { Either, Left, Right } from "~shared/either";

export interface TokenProps {
  value: string;
  isAuth?: boolean;
  isEncrypted?: boolean;
}

export interface TokenOptions {
  expiresIn?: string;
  isEncrypted?: boolean;
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

    let tokenValue = this.props.value;
    if (this.isEncrypted) {
      tokenValue = this.getDecryptValue();
    }

    const isExpired = jwt.isTokenExpired(tokenValue);
    this.props.isAuth = isExpired;

    return this.props.isAuth;
  }

  get isEncrypted(): boolean {
    return this.props.isEncrypted || false;
  }

  public async getDecodedValue<T>(): Promise<T | null> {
    const jwt = DependencyInjection.resolve(JwtService);

    let tokenValue = this.props.value;
    if (this.isEncrypted) {
      tokenValue = this.getDecryptValue();
    }

    return jwt.decodeToken(tokenValue) as T | null;
  }

  public getEncryptValue(): string {
    if (this.isEncrypted) {
      return this.props.value;
    }

    const crypto = DependencyInjection.resolve(Crypto);

    const encryptedData = crypto.encryptValue(this.props.value);
    this.props.value = encryptedData;
    this.props.isEncrypted = true;

    return encryptedData;
  }

  private static decryptValue(value: string): string {
    const crypto = DependencyInjection.resolve(Crypto);

    return crypto.decryptValue(value);
  }

  public getDecryptValue(): string {
    if (!this.isEncrypted) {
      return this.props.value;
    }

    return Token.decryptValue(this.props.value);
  }

  private static isValid<T>(props: T | string): boolean {
    const objectType = typeof props === "object" && !Array.isArray(props);
    const isValidObject = !!props && (objectType || typeof props === "string");

    return isValidObject;
  }

  public static create<T>(
    props: T | string,
    options = {} as TokenOptions
  ): Either<TokenDomainError, Token> {
    const { expiresIn, isEncrypted = false } = options;
    if (!this.isValid<T>(props)) {
      return new Left(new TokenDomainError(TokenDomainErrors.invalidToken));
    }

    const jwt = DependencyInjection.resolve(JwtService);

    let token: string;
    if (isEncrypted) {
      token = this.decryptValue(props as string);
    } else {
      token = jwt.signToken(props as T, expiresIn);
    }

    const isAuth = !jwt.isTokenExpired(token);

    return new Right(new Token({ value: token, isAuth }));
  }
}
