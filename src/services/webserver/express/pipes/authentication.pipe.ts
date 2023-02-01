import JwtService from "~services/jwt/jsonwebtoken";
import { IPipe } from "~services/webserver/express/utils/endpoint-builder";
import { Http } from "~services/webserver/types";
import DependencyInjection from "~shared/dependency-injection";

const authenticationPipe: IPipe = (req, res, next): void => {
  const { authorization } = req.headers;

  if (!authorization) {
    res.status(Http.Status.UNAUTHORIZED).send({ message: "Missing token." });
    return;
  }

  const jwtToken = DependencyInjection.resolve(JwtService);

  const isTokenExpired = jwtToken.isTokenExpired(authorization);
  if (isTokenExpired) {
    res.status(Http.Status.UNAUTHORIZED).send({ message: "Token is expired." });
    return;
  }

  const isTokenValid = jwtToken.isValidToken(authorization);
  if (!isTokenValid) {
    res.status(Http.Status.UNAUTHORIZED).send({ message: "Invalid token." });
    return;
  }

  req.state = { token: jwtToken.decodeToken(authorization) };
  next();
};

export default authenticationPipe;
