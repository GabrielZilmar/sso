import { TriggersOn } from "@gabrielzilmar/event-emitter";
import { TokenTypes } from "~modules/token/Entity/Token";
import { domainEvent } from "~shared/domain/events";

export type TokenUsedEventPayload = {
  userId: string;
  type: TokenTypes;
  usedAt: Date;
};

export default class TokenUsed {
  @TriggersOn("token.used", domainEvent.eventEmitter)
  public tokenUsed(payload: TokenUsedEventPayload) {
    console.info("Token used!");
    console.info(payload);
  }
}
