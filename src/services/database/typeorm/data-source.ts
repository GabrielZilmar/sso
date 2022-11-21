import "reflect-metadata";
import { DataSource } from "typeorm";
// import databaseConfig from "~config/database-config";
import databaseConfig from "../../../config/database-config";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: databaseConfig.databaseUrl,
  port: databaseConfig.port,
  username: databaseConfig.username,
  password: databaseConfig.password,
  database: databaseConfig.database,
  synchronize: true,
  logging: false,
  entities: ["src/modules/**/entity/*{.ts,.js}"],
  migrations: ["src/services/database/typeorm/migrations/*{.ts,.js}"],
  subscribers: ["src/services/database/typeorm/subscribers/*{.ts,.js}"],
});
