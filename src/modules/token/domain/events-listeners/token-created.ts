import { TriggersOn } from "@gabrielzilmar/event-emitter";
import TokenDomain from "~modules/token/domain/token-domain";
import { domainEvent } from "~shared/domain/events";

export type TokenCreatedEventPayload = {
  token: TokenDomain;
};

export default class TokenCreated {
  @TriggersOn("token.created", domainEvent.eventEmitter)
  public tokenCreated(payload: TokenCreatedEventPayload) {
    console.info("Token created!");
    console.info(payload);
  }
}
