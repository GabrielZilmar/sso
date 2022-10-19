import { HttpMethod } from "@/types/http-methods";
import { Router, Request, Response, NextFunction } from "express";

type IHandler = (req: Request, res: Response) => Promise<void> | void;

type IPipe = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

class EndpointBuilder {
  private httpMethod: HttpMethod;
  private path: string;
  private handler: IHandler;
  private pipes: IPipe[];

  static new(path: string): EndpointBuilder {
    const instance = new EndpointBuilder();
    instance.setPath(path);

    return instance;
  }

  constructor() {
    this.pipes = [];
  }

  public setPath(path: string): EndpointBuilder {
    this.path = path;
    return this;
  }

  public addPipe(pipe: IPipe | IPipe[]): EndpointBuilder {
    if (Array.isArray(pipe)) {
      this.pipes = pipe;
    } else {
      this.pipes.push(pipe);
    }
    return this;
  }

  public setHttpMethod(httpMethod: HttpMethod): EndpointBuilder {
    this.httpMethod = httpMethod;
    return this;
  }

  public setHandler(handler: IHandler): EndpointBuilder {
    this.handler = handler;
    return this;
  }

  public getPath(): string {
    return this.path;
  }

  public getHttpMethod(): HttpMethod {
    return this.httpMethod;
  }

  public register(route: Router): void {
    switch (this.httpMethod) {
      case HttpMethod.DELETE:
        route.delete(this.path, ...[...this.pipes, this.handler]);
        break;
      case HttpMethod.POST:
        route.post(this.path, ...[...this.pipes, this.handler]);
        break;
      case HttpMethod.PUT:
        route.put(this.path, ...[...this.pipes, this.handler]);
        break;
      default:
        route.get(this.path, ...[...this.pipes, this.handler]);
        break;
    }
  }
}

export default EndpointBuilder;
