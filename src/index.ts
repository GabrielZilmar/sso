import "reflect-metadata";
import { config } from "dotenv";
import ExpressWebServer from "~services/webserver/express/http-server";
import DependencyInjection from "~shared/dependency-injection";
import { AppDataSource } from "~services/database/typeorm/data-source";

const main = async () => {
  config();
  DependencyInjection.initialize();

  await AppDataSource.initialize();

  const httpServer = DependencyInjection.resolve(ExpressWebServer);
  await httpServer.start();
};

main();
