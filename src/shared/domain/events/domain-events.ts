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

  private getAuthenticationEvents() {
    const events = ["authentication.created"];

    return events;
  }

  private getTokenEvents() {
    const events = ["token.created", "token.used"];

    return events;
  }

  private initialize() {
    const userEvents = this.getUserEvents();
    const authenticationEvents = this.getAuthenticationEvents();
    const tokenEvents = this.getTokenEvents();
    const allEvents = userEvents
      .concat(authenticationEvents)
      .concat(tokenEvents);

    this.eventEmitter = new EventEmitter(allEvents);
    Object.freeze(this);
  }
}
