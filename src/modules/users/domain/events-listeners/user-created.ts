import { TriggersOn } from "@gabrielzilmar/event-emitter";
import { UserDomain } from "~modules/users/domain/user";
import { domainEvent } from "~shared/domain/events";

export type UserCreatedEventPayload = {
  user: UserDomain;
};

export default class UserCreated {
  @TriggersOn("user.created", domainEvent.eventEmitter)
  public userCreated(payload: UserCreatedEventPayload) {
    console.info("User created!");
    console.info(payload);
  }
}
