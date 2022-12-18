export enum AuthenticationDomainErrors {
  invalidAuthenticationUserId = "Authentication user id is not valid.",
  invalidAuthenticationAccessToken = "Access token is not valid. Invalid signature ou invalid format.",
}

export default class AuthenticationDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "authentication-domain";
  }
}
