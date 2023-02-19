import crypto from "crypto";
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

    const algorithm = DependencyInjection.resolve("ALGORITHM") as string;
    const securityKey = DependencyInjection.resolve(
      "ALGORITHM_SECURITY_KEY"
    ) as string;
    const initVector = DependencyInjection.resolve("ALGORITHM_IV") as string;

    const cipher = crypto.createCipheriv(algorithm, securityKey, initVector);

    let encryptedData = cipher.update(this.props.value, "utf-8", "base64");
    encryptedData += cipher.final("base64");
    this.props.value = encryptedData;
    this.props.isEncrypted = true;

    return encryptedData;
  }

  public getDecryptValue(): string {
    if (!this.isEncrypted) {
      return this.props.value;
    }

    const algorithm = DependencyInjection.resolve("ALGORITHM") as string;
    const securityKey = DependencyInjection.resolve(
      "ALGORITHM_SECURITY_KEY"
    ) as string;
    const initVector = DependencyInjection.resolve("ALGORITHM_IV") as string;

    const decipher = crypto.createDecipheriv(
      algorithm,
      securityKey,
      initVector
    );

    let decryptedData = decipher.update(this.props.value, "base64", "utf-8");
    decryptedData += decipher.final("utf8");

    return decryptedData;
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
