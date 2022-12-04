import { FindOptionsWhere } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import RepositoryError from "~services/database/typeorm/repositories/error";
import { Either } from "~shared/either";

export interface IWrite<T> {
  create(item: T): Promise<Either<RepositoryError, T>>;
  update(
    id: string,
    item: QueryDeepPartialEntity<T>
  ): Promise<Either<RepositoryError, boolean>>;
  delete(id: string): Promise<Either<RepositoryError, boolean>>;
}

export interface IRead<T> {
  find(criteria: FindOptionsWhere<T>): Promise<T[]>;
  findOneByCriteria(criteria: FindOptionsWhere<T>): Promise<T | null>;
  findOneById(id: string): Promise<T | null>;
}
