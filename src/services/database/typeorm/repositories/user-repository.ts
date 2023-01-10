import { DeepPartial } from "typeorm";
import { UserDomain } from "~modules/users/domain/user-domain";
import { User } from "~modules/users/entity/User";
import UserMapper from "~modules/users/mappers/user-mapper";
import { BaseRepository } from "~services/database/typeorm/repositories/base/base-repository";
import RepositoryError, {
  RepositoryErrors,
} from "~services/database/typeorm/repositories/error";
import DependencyInjection from "~shared/dependency-injection";
import { Either, Left, Right } from "~shared/either";

export default class UserRepository extends BaseRepository<User, UserDomain> {
  constructor() {
    const userMapper = DependencyInjection.resolve(UserMapper);
    super(User, userMapper);
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
