import jwt, { JwtPayload } from "jsonwebtoken";
import { inject, injectable } from "tsyringe";
import { JwtContract } from "~services/jwt/contract";

@injectable()
export default class JwtService implements JwtContract<JwtPayload> {
  constructor(@inject("JWT_SECRET") private readonly jwtSecret: string) {}

  public decodeToken(token: string): JwtPayload | null {
    const result = jwt.decode(token, { json: true });

    return result;
  }

  public signToken(payload: JwtPayload, expiresIn = "1h"): string {
    const result = jwt.sign(payload, this.jwtSecret, { expiresIn });

    return result;
  }

  public isValidToken(token: string): boolean {
    try {
      jwt.verify(token, this.jwtSecret);

      return true;
    } catch (err) {
      return false;
    }
  }

  public isTokenExpired(token: string): boolean {
    try {
      jwt.verify(token, this.jwtSecret);
    } catch (err) {
      if ((err as Error).message.includes("expired")) {
        return true;
      }
    }

    return false;
  }
}
