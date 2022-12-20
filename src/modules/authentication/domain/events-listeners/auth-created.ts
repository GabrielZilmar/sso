import { TriggersOn } from "@gabrielzilmar/event-emitter";
import AuthenticationDomain from "~modules/authentication/domain/authentication-domain";
import { domainEvent } from "~shared/domain/events";

export type AuthenticationCreatedEventPayload = {
  authentication: AuthenticationDomain;
};

export default class AuthenticationCreated {
  @TriggersOn("authentication.created", domainEvent.eventEmitter)
  public authenticationCreated(payload: AuthenticationCreatedEventPayload) {
    console.info("Authentication created!");
    console.info(payload);
  }
}
