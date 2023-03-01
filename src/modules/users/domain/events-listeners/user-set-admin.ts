import { TriggersOn } from "@gabrielzilmar/event-emitter";
import UserId from "~modules/users/domain/user-id";
import { domainEvent } from "~shared/domain/events";

export type UserSetAdminEventPayload = {
  userId: UserId;
};

export default class UserSetAdmin {
  @TriggersOn("user.set-admin", domainEvent.eventEmitter)
  public UserSetAdmin(payload: UserSetAdminEventPayload) {
    console.info("User set admin!");
    console.info(payload);
  }
}
