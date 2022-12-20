export enum AuthenticationDomainErrors {
  invalidAuthenticationUserId = "Authentication user id is not valid.",
  invalidAuthenticationAccessToken = "Access token is not valid. Invalid signature ou invalid format.",
  invalidAuthenticationAccessTokenProps = "Couldn't create the access token. Props is not an object.",
  invalidAuthenticationProps = "Couldn't create the authentication. Invalid props",
}

export default class AuthenticationDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "authentication-domain";
  }
}
