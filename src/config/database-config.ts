import { config } from "dotenv";
import { join } from "path";

config();

const getDatabasePort = () => Number((process.env.DB_PORT as string) || 0);

const databaseConfig = {
  databaseUrl: process.env.DATABASE_URL as string,
  get port() {
    return getDatabasePort();
  },
  username: process.env.USERNAME as string,
  password: process.env.PASSWORD as string,
  database: process.env.DATABASE as string,
  entitiesPath: join(__dirname, "../modules/**/entity/*.{ts,js}"),
  migrationsPath: join(
    __dirname,
    "../services/database/typeorm/migrations/*{.ts,.js}"
  ),
  subscribersPath: join(
    __dirname,
    "../services/database/typeorm/subscribers/*{.ts,.js}"
  ),
};

export default databaseConfig;
