export interface JwtContract<T> {
  decodeToken: (token: string) => T | null;
  signToken: (payload: T, expiresIn?: string | number) => string;
  isValidToken: (token: string) => boolean;
  isTokenExpired: (token: string) => boolean;
}
