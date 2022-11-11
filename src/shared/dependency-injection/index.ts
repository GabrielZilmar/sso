import { EventEmitter } from "@gabrielzilmar/event-emitter";
import { container, InjectionToken, Lifecycle } from "tsyringe";
import ExpressWebServer from "~services/webserver/express/http-server";

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
    container.register("PORT", { useValue: process.env.port });
    container.register("PASSWORD_SALTA", {
      useValue: process.env.PASSWORD_SALT,
    });
  }

  private static setupServices() {
    container.register<ExpressWebServer>(ExpressWebServer, {
      useClass: ExpressWebServer,
    });
    container.register(
      EventEmitter,
      { useClass: EventEmitter },
      { lifecycle: Lifecycle.Singleton }
    );
  }
}
