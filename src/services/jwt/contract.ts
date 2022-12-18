export interface JwtContract<T> {
  decodeToken: (token: string) => T | null;
  signToken: (payload: T) => string;
  isValidToken: (token: string) => boolean;
}
