export enum SessionDomainErrors {
  invalidSessionUserId = "Session user id is not valid.",
  invalidSessionAccessToken = "Access token is not valid. Invalid signature ou invalid format.",
  invalidSessionAccessTokenProps = "Couldn't create the access token. Props is not an object.",
  invalidSessionProps = "Couldn't create the session. Invalid props",
}

export default class SessionDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "session-domain";
  }
}
