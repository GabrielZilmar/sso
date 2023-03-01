import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
} from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import RepositoryError from "~services/database/typeorm/repositories/error";
import { Either } from "~shared/either";

export interface IWrite<T, D> {
  create(item: T): Promise<Either<RepositoryError, D>>;
  update(
    id: string,
    item: QueryDeepPartialEntity<T>
  ): Promise<Either<RepositoryError, boolean>>;
  delete(id: string): Promise<Either<RepositoryError, boolean>>;
  save(items: T | DeepPartial<T>): Promise<Either<RepositoryError, D>>;
}

export interface IRead<T, D> {
  find(options?: FindManyOptions<T>): Promise<D[]>;
  findOne(options: FindOneOptions<T>): Promise<D | null>;
  findAll(): Promise<{ items: D[]; count: number }>;
  findOneByCriteria(
    criteria: FindOptionsWhere<T> | FindOptionsWhere<T>[]
  ): Promise<D | null>;
  findOneById(id: string): Promise<D | null>;
}
