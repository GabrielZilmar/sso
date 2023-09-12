import { config } from "dotenv";

config();

const getDatabasePort = () => Number((process.env.DB_PORT as string) || 0);
const environment = process.env.NODE_ENV as string;
const isProd = environment === "prod";

const databaseConfig = {
  databaseUrl: process.env.DATABASE_URL as string,
  get port() {
    return getDatabasePort();
  },
  username: process.env.USERNAME as string,
  password: process.env.PASSWORD as string,
  database: process.env.DATABASE as string,
  entitiesPath: isProd
    ? "modules/**/entity/*{.js}"
    : "src/modules/**/entity/*{.ts,.js}",
  migrationsPath: isProd
    ? "services/database/typeorm/migrations/*{.js}"
    : "src/services/database/typeorm/migrations/*{.ts,.js}",
  subscribersPath: isProd
    ? "services/database/typeorm/subscribers/*{.js}"
    : "src/services/database/typeorm/subscribers/*{.ts,.js}",
};

export default databaseConfig;
