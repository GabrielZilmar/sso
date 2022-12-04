import { DeepPartial } from "typeorm";
import { User } from "~modules/users/entity/User";
import { BaseRepository } from "~services/database/typeorm/repositories/base/base-repository";
import RepositoryError, {
  RepositoryErrors,
} from "~services/database/typeorm/repositories/error";
import { Either, Left, Right } from "~shared/either";

export default class UserRepository extends BaseRepository<User> {
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
  ): Promise<Either<RepositoryError, User>> {
    const preventDuplicated = await this.preventDuplicatedUser(item.name);
    if (preventDuplicated.isLeft()) {
      return new Left(preventDuplicated.value);
    }

    const newItem = await this.repository.save(item);

    if (newItem) {
      return new Right(newItem);
    }

    return new Left(new RepositoryError(RepositoryErrors.createError));
  }
}
