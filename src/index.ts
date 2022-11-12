import "reflect-metadata";
import { config } from "dotenv";
import ExpressWebServer from "~services/webserver/express/http-server";
import DependencyInjection from "~shared/dependency-injection";

const main = async () => {
  config();
  DependencyInjection.initialize();

  const httpServer = DependencyInjection.resolve(ExpressWebServer);
  await httpServer.start();
};

main();
