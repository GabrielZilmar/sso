import dotenv from "dotenv";

export type Environment = "prod" | "dev";

dotenv.config();

export default {
  port: process.env.PORT as string,
  env: process.env.NODE_ENV as Environment,
};
