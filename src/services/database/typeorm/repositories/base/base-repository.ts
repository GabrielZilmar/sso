import {
  DeepPartial,
  EntityTarget,
  FindManyOptions,
  FindOneOptions,
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

  constructor(entity: EntityTarget<T>, mapper: Mapper<D, T>) {
    this.repository = AppDataSource.getRepository(entity);
    this.mapper = mapper;
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

  private async preventDuplicateItem(
    id: string
  ): Promise<Either<RepositoryError, boolean>> {
    const itemExist = await this.findOneById(id);

    if (itemExist) {
      return new Left(
        new RepositoryError(RepositoryErrors.itemAlreadyExists, { id })
      );
    }

    return new Right(true);
  }

  async create(item: DeepPartial<T>): Promise<Either<RepositoryError, D>> {
    if (item.id) {
      const preventInexistent = await this.preventDuplicateItem(item.id);
      if (preventInexistent.isLeft()) {
        return new Left(preventInexistent.value);
      }
    }

    const newItem = await this.save(item);

    if (newItem.isLeft()) {
      return new Left(
        new RepositoryError(RepositoryErrors.createError, newItem.value.payload)
      );
    }

    return new Right(newItem.value);
  }

  async update(
    id: string,
    item: QueryDeepPartialEntity<T>
  ): Promise<Either<RepositoryError, boolean>> {
    const preventInexistent = await this.preventInexistentItem(id);
    if (preventInexistent.isLeft()) {
      return new Left(preventInexistent.value);
    }

    try {
      const newItem = await this.repository.update(id, item);
      if (!newItem) {
        return new Left(new RepositoryError(RepositoryErrors.updateError));
      }

      return new Right(true);
    } catch (err) {
      return new Left(
        new RepositoryError(
          RepositoryErrors.updateError,
          (err as Error).message
        )
      );
    }
  }

  async delete(id: string): Promise<Either<RepositoryError, boolean>> {
    const preventInexistent = await this.preventInexistentItem(id);
    if (preventInexistent.isLeft()) {
      return new Left(preventInexistent.value);
    }

    await this.repository.delete(id);

    return new Right(true);
  }

  async save(item: T | DeepPartial<T>): Promise<Either<RepositoryError, D>> {
    try {
      const savedItem = await this.repository.save(item);

      const itemDomain = await this.mapper.toDomain(savedItem);
      if (itemDomain.isLeft()) {
        return new Left(new RepositoryError(RepositoryErrors.saveError));
      }

      return new Right(itemDomain.value);
    } catch (err) {
      return new Left(
        new RepositoryError(RepositoryErrors.saveError, (err as Error).message)
      );
    }
  }

  async findAll(skip = 0, take = 10): Promise<{ items: D[]; count: number }> {
    const [items, count] = await this.repository.findAndCount({
      skip,
      take,
    });

    const itemsToDomain: D[] = [];
    for await (const item of items) {
      const itemToDomain = await this.mapper.toDomain(item);

      if (itemToDomain.isRight()) {
        itemsToDomain.push(itemToDomain.value);
      }
    }

    return { items: itemsToDomain, count };
  }

  async findOne(options: FindOneOptions<T>): Promise<D | null> {
    const item = await this.repository.findOne(options);
    if (!item) {
      return null;
    }

    const itemToDomain = await this.mapper.toDomain(item);
    return itemToDomain.isRight() ? itemToDomain.value : null;
  }

  async find(options?: FindManyOptions<T>): Promise<D[]> {
    const items = await this.repository.find(options);

    const itemsToDomain: D[] = [];
    for await (const item of items) {
      const itemToDomain = await this.mapper.toDomain(item);

      if (itemToDomain.isRight()) {
        itemsToDomain.push(itemToDomain.value);
      }
    }

    return itemsToDomain;
  }

  async findOneByCriteria(
    criteria: FindOptionsWhere<T> | FindOptionsWhere<T>[]
  ): Promise<D | null> {
    const item = await this.repository.findOneBy(criteria);
    if (!item) {
      return null;
    }

    const itemToDomain = await this.mapper.toDomain(item);
    return itemToDomain.isRight() ? itemToDomain.value : null;
  }

  async findOneById(id: string): Promise<D | null> {
    const criteria = { id } as FindOptionsWhere<T>;

    const item = await this.repository.findOneBy(criteria);
    if (!item) {
      return null;
    }

    const itemToDomain = await this.mapper.toDomain(item);
    return itemToDomain.isRight() ? itemToDomain.value : null;
  }
}
