import {
  DeepPartial,
  EntityTarget,
  FindOptionsWhere,
  Repository,
} from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { AppDataSource } from "~services/database/typeorm/data-source";
import RepositoryError, {
  RepositoryErrors,
} from "~services/database/typeorm/repositories/error";
import {
  IRead,
  IWrite,
} from "~services/database/typeorm/repositories/interfaces/interfaces";
import { Mapper } from "~shared/domain/mapper";
import { Either, Left, Right } from "~shared/either";

export abstract class BaseRepository<T extends { id: string }, D>
  implements IWrite<T, D>, IRead<T, D>
{
  public readonly repository: Repository<T>;
  public readonly mapper: Mapper<D, T>;

  constructor(entity: EntityTarget<T>) {
    this.repository = AppDataSource.getRepository(entity);
  }

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

  async create(item: DeepPartial<T>): Promise<Either<RepositoryError, D>> {
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

  async update(
    id: string,
    item: QueryDeepPartialEntity<T>
  ): Promise<Either<RepositoryError, boolean>> {
    const preventInexistent = await this.preventInexistentItem(id);
    if (preventInexistent.isLeft()) {
      return new Left(preventInexistent.value);
    }

    const newItem = await this.repository.update(id, item);
    if (!newItem) {
      return new Left(new RepositoryError(RepositoryErrors.updateError));
    }

    return new Right(true);
  }

  async delete(id: string): Promise<Either<RepositoryError, boolean>> {
    const preventInexistent = await this.preventInexistentItem(id);
    if (preventInexistent.isLeft()) {
      return new Left(preventInexistent.value);
    }

    await this.repository.delete(id);

    return new Right(true);
  }

  async findAll(): Promise<D[]> {
    const items = await this.repository.find();

    const itemsToDomain: D[] = [];
    for await (const item of items) {
      const itemToDomain = await this.mapper.toDomain(item);

      if (itemToDomain.isRight()) {
        itemsToDomain.push(itemToDomain.value);
      }
    }

    return itemsToDomain;
  }

  async find(criteria: FindOptionsWhere<T>): Promise<D[]> {
    const items = await this.repository.findBy(criteria);

    const itemsToDomain: D[] = [];
    for await (const item of items) {
      const itemToDomain = await this.mapper.toDomain(item);

      if (itemToDomain.isRight()) {
        itemsToDomain.push(itemToDomain.value);
      }
    }

    return itemsToDomain;
  }

  async findOneByCriteria(criteria: FindOptionsWhere<T>): Promise<D | null> {
    const item = await this.repository.findOneBy(criteria);
    const itemToDomain = await this.mapper.toDomain(item);

    return itemToDomain.isRight() ? itemToDomain.value : null;
  }

  async findOneById(id: string): Promise<D | null> {
    const criteria = { id } as FindOptionsWhere<T>;

    const item = await this.repository.findOneBy(criteria);
    const itemToDomain = await this.mapper.toDomain(item);

    return itemToDomain.isRight() ? itemToDomain.value : null;
  }
}
