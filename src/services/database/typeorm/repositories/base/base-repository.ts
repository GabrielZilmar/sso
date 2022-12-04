import { FindOptionsWhere, Repository, UpdateResult } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import RepositoryError, {
  RepositoryErrors,
} from "~services/database/typeorm/repositories/error";
import {
  IRead,
  IWrite,
} from "~services/database/typeorm/repositories/interfaces/interfaces";
import { Either, Left, Right } from "~shared/either";

export abstract class IBaseRepository<T extends { id: string }>
  implements IWrite<T>, IRead<T>
{
  public readonly repository: Repository<T>;

  private async preventInexistentItem(
    id: string
  ): Promise<Either<RepositoryError, boolean>> {
    const itemExist = await this.findOneById(id);

    if (!itemExist) {
      return new Left(
        new RepositoryError(RepositoryErrors.itemNotFound, { id })
      );
    }

    return new Right(true);
  }

  async create(item: T): Promise<Either<RepositoryError, T>> {
    const newItem = await this.repository.save<T>(item);

    if (newItem) {
      return new Right(newItem);
    }

    return new Left(new RepositoryError(RepositoryErrors.createError));
  }

  async update(
    id: string,
    item: QueryDeepPartialEntity<T>
  ): Promise<Either<RepositoryError, UpdateResult>> {
    const preventInexistent = await this.preventInexistentItem(id);
    if (preventInexistent.isLeft()) {
      return new Left(preventInexistent.value);
    }

    const newItem = await this.repository.update(id, item);
    if (!newItem) {
      return new Left(new RepositoryError(RepositoryErrors.updateError));
    }

    return new Right(newItem);
  }

  async delete(id: string): Promise<Either<RepositoryError, boolean>> {
    const preventInexistent = await this.preventInexistentItem(id);
    if (preventInexistent.isLeft()) {
      return new Left(preventInexistent.value);
    }

    await this.repository.delete(id);
  }

  async find(criteria: FindOptionsWhere<T>): Promise<T[]> {
    const items = await this.repository.findBy(criteria);

    return items;
  }

  async findOneByCriteria(criteria: FindOptionsWhere<T>): Promise<T | null> {
    const item = await this.repository.findOneBy(criteria);

    return item || null;
  }

  async findOneById(id: string): Promise<T | null> {
    const criteria = { id } as FindOptionsWhere<T>;
    const item = await this.repository.findOneBy(criteria);

    return item || null;
  }
}
