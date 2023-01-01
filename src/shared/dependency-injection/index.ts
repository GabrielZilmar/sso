import { container, InjectionToken } from "tsyringe";
import AuthenticationCreated from "~modules/authentication/domain/events-listeners/auth-created";
import UserCreated from "~modules/users/domain/events-listeners/user-created";
import UserMapper from "~modules/users/mappers/user-mapper";
import GetUser from "~modules/users/use-cases/get-user";
import UserRepository from "~services/database/typeorm/repositories/user-repository";
import JwtService from "~services/jwt/jsonwebtoken";
import ExpressWebServer from "~services/webserver/express/http-server";

export type Environment = "prod" | "dev";

export default class DependencyInjection {
  public static initialize() {
    this.setupEnvironment();
    this.setupServices();
    this.setupEventListeners();
    this.setupRepositories();
    this.setupMappers();
    this.setupUseCases();
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
    container.register("JWT_SECRET", { useValue: process.env.JWT_SECRET });
  }

  private static setupServices() {
    container.register(ExpressWebServer, {
      useClass: ExpressWebServer,
    });
    container.register(JwtService, {
      useClass: JwtService,
    });
  }

  private static setupEventListeners() {
    container.register(UserCreated, {
      useClass: UserCreated,
    });
    container.register(AuthenticationCreated, {
      useClass: AuthenticationCreated,
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

  public static setupUseCases() {
    container.register(GetUser, {
      useClass: GetUser,
    });
  }
}
