import { container, InjectionToken } from "tsyringe";
import AuthenticationCreated from "~modules/authentication/domain/events-listeners/auth-created";
import LoginUseCase from "~modules/authentication/use-case/login";
import SendValidateEmail from "~modules/authentication/use-case/send-validate-email";
import TokenMapper from "~modules/token/mappers/token-mapper";
import UserCreated from "~modules/users/domain/events-listeners/user-created";
import UserDeleted from "~modules/users/domain/events-listeners/user-deleted";
import UserMapper from "~modules/users/mappers/user-mapper";
import AuthEmail from "~modules/users/use-cases/auth-email";
import CreateUser from "~modules/users/use-cases/create-user";
import DeleteUser from "~modules/users/use-cases/delete-user";
import GetUser from "~modules/users/use-cases/get-user";
import GetUserByName from "~modules/users/use-cases/get-user-by-name";
import GetUsers from "~modules/users/use-cases/get-users";
import UpdateUser from "~modules/users/use-cases/update-user";
import TokenRepository from "~services/database/typeorm/repositories/token-repository";
import UserRepository from "~services/database/typeorm/repositories/user-repository";
import EmailSender from "~services/email-sender/nodemailer";
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
    container.register("EMAIL_SERVICE", {
      useValue: process.env.EMAIL_SERVICE,
    });
    container.register("EMAIL_SENDER", { useValue: process.env.EMAIL_SENDER });
    container.register("EMAIL_PASSWORD", {
      useValue: process.env.EMAIL_PASSWORD,
    });
    container.register("CLIENT_LINK", {
      useValue: process.env.CLIENT_LINK,
    });
  }

  private static setupServices() {
    container.register(ExpressWebServer, {
      useClass: ExpressWebServer,
    });
    container.register(JwtService, {
      useClass: JwtService,
    });
    container.register(EmailSender, {
      useClass: EmailSender,
    });
  }

  private static setupEventListeners() {
    container.register(UserCreated, {
      useClass: UserCreated,
    });
    container.register(UserDeleted, {
      useClass: UserDeleted,
    });
    container.register(AuthenticationCreated, {
      useClass: AuthenticationCreated,
    });
  }

  private static setupRepositories() {
    container.register(UserRepository, {
      useClass: UserRepository,
    });
    container.register(TokenRepository, {
      useClass: TokenRepository,
    });
  }

  public static setupMappers() {
    container.register(UserMapper, {
      useClass: UserMapper,
    });
    container.register(TokenMapper, {
      useClass: TokenMapper,
    });
  }

  public static setupUseCases() {
    //User UseCases
    container.register(GetUser, {
      useClass: GetUser,
    });
    container.register(GetUserByName, {
      useClass: GetUserByName,
    });
    container.register(GetUsers, {
      useClass: GetUsers,
    });
    container.register(DeleteUser, {
      useClass: DeleteUser,
    });
    container.register(UpdateUser, {
      useClass: UpdateUser,
    });
    container.register(CreateUser, {
      useClass: CreateUser,
    });
    container.register(CreateUser, {
      useClass: CreateUser,
    });
    container.register(AuthEmail, {
      useClass: AuthEmail,
    });

    // Authentication UseCases
    container.register(LoginUseCase, {
      useClass: LoginUseCase,
    });
    container.register(SendValidateEmail, {
      useClass: SendValidateEmail,
    });
  }
}
