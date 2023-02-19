import { EventName } from "@gabrielzilmar/event-emitter";
import { Entity } from "~shared/domain/entity";
import { domainEvent } from "~shared/domain/events";
import { IDomainEvent } from "~shared/domain/events/interface-domain-event";
import { UniqueEntityID } from "~shared/domain/unique-entity-id";

export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents = domainEvent;

  get id(): UniqueEntityID | null {
    return this._id;
  }

  get domainEvents(): IDomainEvent<T>[] {
    return this.domainEvents;
  }

  protected async emitEvent<T>(
    eventName: EventName,
    payload: T
  ): Promise<void> {
    await this._domainEvents.eventEmitter.emit(eventName, payload);
  }
}
