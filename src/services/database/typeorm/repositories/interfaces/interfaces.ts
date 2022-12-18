import { FindOptionsWhere } from "typeorm";
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
}

export interface IRead<T, D> {
  find(criteria: FindOptionsWhere<T>): Promise<D[]>;
  findAll(): Promise<D[]>;
  findOneByCriteria(criteria: FindOptionsWhere<T>): Promise<D | null>;
  findOneById(id: string): Promise<D | null>;
}
