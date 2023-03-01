import { validate } from "uuid";
import SessionDomainError, {
  SessionDomainErrors,
} from "~modules/session/domain/errors";
import { SessionCreatedEventPayload } from "~modules/session/domain/events-listeners/auth-created";
import Token from "~modules/token/domain/value-objects/token";
import { AggregateRoot } from "~shared/domain/aggregate-root";
import { UniqueEntityID } from "~shared/domain/unique-entity-id";
import { Either, Left, Right } from "~shared/either";

export interface SessionDomainProps {
  accessToken: Token;
  userId: string;
}

export default class SessionDomain extends AggregateRoot<SessionDomainProps> {
  private constructor(props: SessionDomainProps, id?: UniqueEntityID | null) {
    super(props, id);
  }

  get accessToken(): Token {
    return this.props.accessToken;
  }

  get userId(): string {
    return this.props.userId;
  }

  private static isValid(props: SessionDomainProps): boolean {
    const { accessToken, userId } = props;
    const isValidUserId = validate(userId);

    return !!accessToken && isValidUserId;
  }

  public static async create(
    props: SessionDomainProps,
    id?: UniqueEntityID
  ): Promise<Either<SessionDomainError, SessionDomain>> {
    if (!this.isValid(props)) {
      return new Left(
        new SessionDomainError(SessionDomainErrors.invalidSessionProps)
      );
    }

    const auth = new SessionDomain({ ...props }, id);

    const isNewAuth = !id;
    if (isNewAuth) {
      const eventPayload: SessionCreatedEventPayload = {
        session: auth,
      };
      await auth.emitEvent("session.created", eventPayload);
    }

    return new Right(auth);
  }
}
