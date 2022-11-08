import { Entity } from "~shared/domain/entity";
import { IDomainEvent } from "~shared/domain/events/interface-domain-event";
import { UniqueEntityID } from "~shared/domain/unique-entity-id";

export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: IDomainEvent<T>[] = [];

  get id(): UniqueEntityID {
    return this._id;
  }

  get domainEvents(): IDomainEvent<T>[] {
    return this.domainEvents;
  }

  protected addDomainEvent(domainEvent: IDomainEvent<T>): void {
    this._domainEvents.push(domainEvent);
  }
}
