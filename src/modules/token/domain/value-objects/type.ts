import TokenDomainError, {
  TokenDomainErrors,
} from "~modules/token/domain/errors";
import { TokenTypes, TOKEN_TYPES_ENUM } from "~modules/token/entity/Token";
import { ValueObject } from "~shared/domain/value-object";
import { Either, Left, Right } from "~shared/either";

export interface TokenTypeProps {
  value: TokenTypes;
}

export default class TokenType extends ValueObject<TokenTypeProps> {
  private constructor(props: TokenTypeProps) {
    super(props);
  }

  get value(): TokenTypes {
    return this.props.value;
  }
  private static isValid(name: TokenTypes): boolean {
    return TOKEN_TYPES_ENUM.includes(name);
  }

  public static create(value: TokenTypes): Either<TokenDomainError, TokenType> {
    if (!this.isValid(value)) {
      return new Left(new TokenDomainError(TokenDomainErrors.invalidType));
    }

    return new Right(new TokenType({ value }));
  }
}
