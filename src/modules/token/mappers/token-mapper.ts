import TokenDomainError from "~modules/token/domain/errors";
import TokenDomain from "~modules/token/domain/token-domain";
import Token from "~modules/token/domain/value-objects/token";
import TokenType from "~modules/token/domain/value-objects/type";
import { Token as TokenEntity, TokenTypes } from "~modules/token/Entity/Token";
import { Mapper } from "~shared/domain/mapper";
import { UniqueEntityID } from "~shared/domain/unique-entity-id";
import { Either, Left, Right } from "~shared/either";

export default class TokenMapper implements Mapper<TokenDomain, TokenEntity> {
  public async toDomain(
    entity: TokenEntity
  ): Promise<Either<TokenDomainError, TokenDomain>> {
    const { id, userId, type, token, expiry, usedAt } = entity;

    const uniqueId = new UniqueEntityID(id);

    const typeOrError = TokenType.create(type as TokenTypes);
    if (typeOrError.isLeft()) {
      return new Left(typeOrError.value);
    }

    const tokenOrError = Token.create(token);
    if (tokenOrError.isLeft()) {
      return new Left(tokenOrError.value);
    }

    const newToken = await TokenDomain.create(
      {
        userId,
        type: typeOrError.value,
        token: tokenOrError.value,
        expiry: new Date(expiry),
        usedAt,
      },
      uniqueId
    );
    if (newToken.isLeft()) {
      return new Left(newToken.value);
    }

    return new Right(newToken.value);
  }

  public async toPersistence(token: TokenDomain): Promise<TokenEntity> {
    // TODO: Crypt token

    const newToken = {
      id: token.id?.toValue(),
      userId: token.userId,
      type: token.token.value,
      token: token.token.value,
      expiry: token.expiry.getTime(),
      usedAt: token.usedAt || null,
    } as TokenEntity;

    return newToken;
  }
}
