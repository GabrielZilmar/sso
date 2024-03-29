import { TriggersOn } from "@gabrielzilmar/event-emitter";
import UserId from "~modules/users/domain/user-id";
import { domainEvent } from "~shared/domain/events";

export type UserDeletedEventPayload = {
  userId: UserId;
  userEmail: string;
  deletedTime: Date;
};

export default class UserDeleted {
  @TriggersOn("user.deleted", domainEvent.eventEmitter)
  public userDeleted(payload: UserDeletedEventPayload) {
    console.info("User deleted!");
    console.info(payload);
  }
}
