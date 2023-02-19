import Token from "~modules/token/domain/value-objects/token";
import TokenId from "~modules/token/domain/token-id";
import TokenType from "~modules/token/domain/value-objects/type";
import { AggregateRoot } from "~shared/domain/aggregate-root";
import { UniqueEntityID } from "~shared/domain/unique-entity-id";
import TokenDomainError, {
  TokenDomainErrors,
} from "~modules/token/domain/errors";
import { Either, Left, Right } from "~shared/either";
import { TokenCreatedEventPayload } from "~modules/token/domain/events-listeners/token-created";
import { TokenUsedEventPayload } from "~modules/token/domain/events-listeners/token-used";

export interface TokenDomainProps {
  userId: string;
  type: TokenType;
  token: Token;
  expiry: Date;
  usedAt?: Date | null;
}

export default class TokenDomain extends AggregateRoot<TokenDomainProps> {
  private constructor(props: TokenDomainProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get tokenId(): TokenId {
    return TokenId.create(this._id);
  }

  get userId(): string {
    return this.props.userId;
  }

  get type(): TokenType {
    return this.props.type;
  }

  get token(): Token {
    return this.props.token;
  }

  get expiry(): Date {
    return this.props.expiry;
  }

  get usedAt(): Date | null {
    return this.props.usedAt || null;
  }

  private static isValid(props: TokenDomainProps): boolean {
    const { userId, type, token } = props;

    return !!userId && !!type && !!token;
  }

  public async useToken(): Promise<void> {
    if (!this.usedAt) {
      this.props.usedAt = new Date();

      const eventPayload: TokenUsedEventPayload = {
        userId: this.userId,
        type: this.type.value,
        usedAt: new Date(),
      };
      await this.emitEvent("token.used", eventPayload);
    }
  }

  public static async create(
    props: TokenDomainProps,
    id?: UniqueEntityID
  ): Promise<Either<TokenDomainError, TokenDomain>> {
    if (!this.isValid(props)) {
      return new Left(
        new TokenDomainError(TokenDomainErrors.invalidTokenProps)
      );
    }

    const isNewToken = !id;

    const token = new TokenDomain(
      {
        ...props,
        usedAt: props.usedAt || null,
      },
      id
    );

    if (isNewToken) {
      const eventPayload: TokenCreatedEventPayload = { token };
      await token.emitEvent("token.created", eventPayload);
    }

    return new Right(token);
  }
}
