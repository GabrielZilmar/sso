import { DeepPartial } from "typeorm";
import { UserDomain } from "~modules/users/domain/user-domain";
import { User } from "~modules/users/entity/User";
import { BaseRepository } from "~services/database/typeorm/repositories/base/base-repository";
import RepositoryError, {
  RepositoryErrors,
} from "~services/database/typeorm/repositories/error";
import { Either, Left, Right } from "~shared/either";

export default class UserRepository extends BaseRepository<User, UserDomain> {
  constructor() {
    super(User);
  }

  private async preventDuplicatedUser(
    name: string
  ): Promise<Either<RepositoryError, boolean>> {
    const itemExist = await this.findOneByCriteria({ name });

    if (itemExist) {
      return new Left(
        new RepositoryError(RepositoryErrors.itemDuplicated, { name })
      );
    }

    return new Right(true);
  }

  async create(
    item: DeepPartial<User>
  ): Promise<Either<RepositoryError, UserDomain>> {
    const preventDuplicated = await this.preventDuplicatedUser(item.name);
    if (preventDuplicated.isLeft()) {
      return new Left(preventDuplicated.value);
    }

    const newItem = await this.repository.save(item);

    if (newItem) {
      const newItemDomain = await this.mapper.toDomain(newItem);

      if (newItemDomain.isLeft()) {
        return new Left(new RepositoryError(RepositoryErrors.createError));
      }

      return new Right(newItemDomain.value);
    }

    return new Left(new RepositoryError(RepositoryErrors.createError));
  }
}
