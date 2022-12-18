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

  public signToken(payload: JwtPayload): string {
    const result = jwt.sign(payload, this.jwtSecret);

    return result;
  }

  public isValidToken(token: string): boolean {
    const isValidToken = jwt.verify(token, this.jwtSecret);

    return !!isValidToken;
  }
}
