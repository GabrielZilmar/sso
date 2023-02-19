export enum TokenDomainErrors {
  invalidType = "Token type is not valid",
  invalidToken = "Token is not valid. Invalid signature ou invalid format.",
  invalidTokenProps = "Couldn't create the token. Invalid props",
}

export default class TokenDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "token-domain";
  }
}
