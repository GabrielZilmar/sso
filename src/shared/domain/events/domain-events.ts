import { EventEmitter } from "@gabrielzilmar/event-emitter";

export default class DomainEvents {
  public eventEmitter: EventEmitter;

  constructor() {
    this.initialize();
  }

  private getUserEvents() {
    const events = [
      "user.create",
      "user.update",
      "user.deleted",
      "user.get",
      "user.verified",
    ];

    return events;
  }

  private initialize() {
    const allEvents = [];
    allEvents.concat(this.getUserEvents());

    this.eventEmitter = new EventEmitter(allEvents);
  }
}
