import { httpServer } from "~services/webserver/express";

const main = async () => {
  await httpServer.start();
};

main();
