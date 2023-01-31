import { validate } from "uuid";
import AuthenticationDomainError, {
  AuthenticationDomainErrors,
} from "~modules/authentication/domain/errors";
import { AuthenticationCreatedEventPayload } from "~modules/authentication/domain/events-listeners/auth-created";
import AccessToken from "~modules/authentication/domain/value-objects/access-token";
import { AggregateRoot } from "~shared/domain/aggregate-root";
import { UniqueEntityID } from "~shared/domain/unique-entity-id";
import { Either, Left, Right } from "~shared/either";

export interface AuthenticationDomainProps {
  accessToken: AccessToken;
  userId: string;
}

export default class AuthenticationDomain extends AggregateRoot<AuthenticationDomainProps> {
  private constructor(props: AuthenticationDomainProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get accessToken(): AccessToken {
    return this.props.accessToken;
  }

  get userId(): string {
    return this.props.userId;
  }

  private static isValid(props: AuthenticationDomainProps): boolean {
    const { accessToken, userId } = props;
    const isValidUserId = validate(userId);

    return !!accessToken && isValidUserId;
  }

  public static async create(
    props: AuthenticationDomainProps,
    id?: UniqueEntityID
  ): Promise<Either<AuthenticationDomainError, AuthenticationDomain>> {
    if (!this.isValid(props)) {
      return new Left(
        new AuthenticationDomainError(
          AuthenticationDomainErrors.invalidAuthenticationProps
        )
      );
    }

    const auth = new AuthenticationDomain({ ...props }, id);

    const isNewAuth = !id;
    if (isNewAuth) {
      const eventPayload: AuthenticationCreatedEventPayload = {
        authentication: auth,
      };
      await auth.emitEvent("authentication.created", eventPayload);
    }

    return new Right(auth);
  }
}
