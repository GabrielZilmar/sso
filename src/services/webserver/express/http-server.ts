import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { inject, injectable } from "tsyringe";
import { WebServer } from "~services/webserver/contract";
import { glob } from "glob";
import http from "http";
import EndpointBuilder from "~services/webserver/express/utils/endpoint-builder";

declare module "express-serve-static-core" {
  interface Request {
    state: unknown;
  }
}

@injectable()
export default class ExpressWebServer implements WebServer {
  constructor(
    @inject("ENVIRONMENT") private readonly env: string,
    @inject("PORT") private readonly port: number
  ) {}

  public async setup(): Promise<http.Server> {
    const app = express();

    app.use(cors({ credentials: true, origin: true }));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cookieParser());

    const endpointFiles = `../../../**/routes/*.${
      this.env === "prod" ? "js" : "ts"
    }`;

    await Promise.all(
      glob
        .sync(endpointFiles, { cwd: __dirname, root: __dirname })
        .map(async (path) => {
          const endpoint = (await import(path)).default as EndpointBuilder;

          console.info(
            `[ROUTE] ${endpoint
              .getHttpMethod()
              .toUpperCase()} ${endpoint.getPath()}`
          );

          endpoint.register(app);
        })
    );

    const port = this.port || 8000;
    const server = app.listen(port);

    console.info(`[SERVER] Running on port ${port}`);

    return server;
  }

  public async start(): Promise<void> {
    this.setup();
  }
}
