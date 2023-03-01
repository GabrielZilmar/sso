import { TriggersOn } from "@gabrielzilmar/event-emitter";
import SessionDomain from "~modules/session/domain/session-domain";
import { domainEvent } from "~shared/domain/events";

export type SessionCreatedEventPayload = {
  session: SessionDomain;
};

export default class SessionCreated {
  @TriggersOn("session.created", domainEvent.eventEmitter)
  public sessionCreated(payload: SessionCreatedEventPayload) {
    console.info("Session created!");
    console.info(payload);
  }
}
