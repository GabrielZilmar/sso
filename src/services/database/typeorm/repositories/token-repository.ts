import { DeepPartial } from "typeorm";
import TokenDomain from "~modules/token/domain/token-domain";
import { Token, TokenTypes } from "~modules/token/entity/Token";
import TokenMapper from "~modules/token/mappers/token-mapper";
import { BaseRepository } from "~services/database/typeorm/repositories/base/base-repository";
import RepositoryError, {
  RepositoryErrors,
} from "~services/database/typeorm/repositories/error";
import DependencyInjection from "~shared/dependency-injection";
import { Either, Left, Right } from "~shared/either";

export type PreventRecreateTokenParams = {
  userId?: string;
  type?: TokenTypes;
};

export default class TokenRepository extends BaseRepository<
  Token,
  TokenDomain
> {
  constructor() {
    const tokenMapper = DependencyInjection.resolve(TokenMapper);
    super(Token, tokenMapper);
  }

  private async preventRecreateToken({
    userId,
    type,
  }: PreventRecreateTokenParams): Promise<TokenDomain | null> {
    if (!userId || !type) return null;

    const itemExist = await this.findOne({
      where: { userId, type },
      order: {
        createdAt: "DESC",
      },
    });
    if (!itemExist) return null;

    const isExpired = new Date() > itemExist.expiry;
    const needRecreate = isExpired || !!itemExist.usedAt;
    if (!needRecreate) {
      return itemExist;
    }

    return null;
  }

  async create(
    item: DeepPartial<Token>
  ): Promise<Either<RepositoryError, TokenDomain>> {
    const preventRecreate = await this.preventRecreateToken({
      userId: item.userId,
      type: item.type,
    });
    if (preventRecreate) {
      return new Right(preventRecreate);
    }

    try {
      const newItem = await this.repository.save(item);

      const newItemDomain = await this.mapper.toDomain(newItem);

      if (newItemDomain.isLeft()) {
        return new Left(new RepositoryError(RepositoryErrors.createError));
      }

      return new Right(newItemDomain.value);
    } catch (err) {
      return new Left(
        new RepositoryError(
          RepositoryErrors.createError,
          (err as Error).message
        )
      );
    }
  }
}
