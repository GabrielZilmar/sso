import { EventEmitter } from "@gabrielzilmar/event-emitter";

export default class DomainEvents {
  public eventEmitter: EventEmitter;

  constructor() {
    this.initialize();
  }

  private getUserEvents() {
    const events = [
      "user.created",
      "user.update",
      "user.deleted",
      "user.get",
      "user.verified",
    ];

    return events;
  }

  private initialize() {
    const allEvents = this.getUserEvents();

    this.eventEmitter = new EventEmitter(allEvents);
  }
}
