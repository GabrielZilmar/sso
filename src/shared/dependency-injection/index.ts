import { container, InjectionToken } from "tsyringe";
import ExpressWebServer from "~services/webserver/express/http-server";
import DomainEvents from "~shared/domain/events/domain-events";

export type Environment = "prod" | "dev";

export default class DependencyInjection {
  public static initialize() {
    this.setupEnvironment();
    this.setupServices();
  }

  public static resolve<T>(token: InjectionToken<T>): T {
    return container.resolve<T>(token);
  }

  private static setupEnvironment(): void {
    container.register("ENVIRONMENT", { useValue: process.env.NODE_ENV });
    container.register("PORT", { useValue: process.env.PORT });
    container.register("PASSWORD_SALT", {
      useValue: process.env.PASSWORD_SALT,
    });
  }

  private static setupServices() {
    container.register(ExpressWebServer, {
      useClass: ExpressWebServer,
    });
    container.registerSingleton("DomainEvents", DomainEvents);
  }
}
