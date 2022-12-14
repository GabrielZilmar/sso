import { container, InjectionToken } from "tsyringe";
import UserCreated from "~modules/users/domain/events-listeners/user-created";
import UserMapper from "~modules/users/mappers/user-mapper";
import UserRepository from "~services/database/typeorm/repositories/user-repository";
import ExpressWebServer from "~services/webserver/express/http-server";

export type Environment = "prod" | "dev";

export default class DependencyInjection {
  public static initialize() {
    this.setupEnvironment();
    this.setupServices();
    this.setupEventListeners();
    this.setupRepositories();
    this.setupMappers();
  }

  public static resolve<T>(token: InjectionToken<T>): T {
    return container.resolve<T>(token);
  }

  private static setupEnvironment(): void {
    container.register("ENVIRONMENT", { useValue: process.env.NODE_ENV });
    container.register("PORT", { useValue: process.env.PORT });
    container.register("PASSWORD_SALT", {
      useValue: Number(process.env.PASSWORD_SALT),
    });
  }

  private static setupServices() {
    container.register(ExpressWebServer, {
      useClass: ExpressWebServer,
    });
  }

  private static setupEventListeners() {
    container.register(UserCreated, {
      useClass: UserCreated,
    });
  }

  private static setupRepositories() {
    container.register(UserRepository, {
      useClass: UserRepository,
    });
  }

  public static setupMappers() {
    container.register(UserMapper, {
      useClass: UserMapper,
    });
  }
}
