import dotenv from "dotenv";

export type Environment = "prod" | "dev";

dotenv.config();

const getPasswordSalt = () => {
  const passwordSalt = process.env.PASSWORD_SALT as string;

  return passwordSalt ? Number(passwordSalt) : 0;
};

export default {
  port: process.env.PORT as string,
  env: process.env.NODE_ENV as Environment,
  get passwordSalt() {
    return getPasswordSalt();
  },
};
