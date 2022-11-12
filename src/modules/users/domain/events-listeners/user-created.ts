import { TriggersOn } from "@gabrielzilmar/event-emitter";
import { User } from "~modules/users/domain/user";
import DependencyInjection from "~shared/dependency-injection";
import { domainEvent } from "~shared/domain/events";
import DomainEvents from "~shared/domain/events/domain-events";

export interface UserCreatedEventPayload {
  user: User;
}

export default class UserCreated {
  @TriggersOn("user.created", domainEvent.eventEmitter)
  public userCreated(payload: UserCreatedEventPayload) {
    console.info("User created!");
    console.info(payload);
  }
}
