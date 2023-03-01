import { config } from "dotenv";

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
};

export default databaseConfig;
