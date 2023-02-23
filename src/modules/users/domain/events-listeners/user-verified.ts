import { TriggersOn } from "@gabrielzilmar/event-emitter";
import UserId from "~modules/users/domain/user-id";
import { domainEvent } from "~shared/domain/events";

export type UserEmailVerifiedEventPayload = {
  userId: UserId;
  email: string;
};

export default class UserEmailVerified {
  @TriggersOn("user.verified", domainEvent.eventEmitter)
  public UserEmailVerified(payload: UserEmailVerifiedEventPayload) {
    console.info("User email verified!");
    console.info(payload);
  }
}
