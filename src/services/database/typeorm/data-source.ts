import "reflect-metadata";
import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import databaseConfig from "~config/database-config";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: databaseConfig.databaseUrl,
  port: databaseConfig.port,
  username: databaseConfig.username,
  password: databaseConfig.password,
  database: databaseConfig.database,
  synchronize: true,
  logging: false,
  namingStrategy: new SnakeNamingStrategy(),
  entities: ["src/modules/**/entity/*{.ts,.js}"],
  migrations: ["src/services/database/typeorm/migrations/*{.ts,.js}"],
  subscribers: ["src/services/database/typeorm/subscribers/*{.ts,.js}"],
});
