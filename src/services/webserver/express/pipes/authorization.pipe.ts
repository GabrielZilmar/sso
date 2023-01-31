import { UserDTO } from "~modules/users/dto/user-dto";
import { IPipe } from "~services/webserver/express/utils/endpoint-builder";
import { Http } from "~services/webserver/types";

const userCanAccess = (
  params: Record<string, unknown>,
  token: Partial<UserDTO>
): boolean => {
  return Object.keys(params).every((item) => {
    if (token[item]) {
      return token[item] === params[item];
    }
    return true;
  });
};

const authorizationPipe: IPipe = (req, res, next): void => {
  const { body, params } = req;
  const { token } = req.state as {
    token: UserDTO;
  };

  const { isAdmin } = token;
  if (isAdmin) {
    next();
    return;
  }

  const canAccess = userCanAccess(params, token) && userCanAccess(body, token);
  if (!canAccess) {
    res.status(Http.Status.FORBIDDEN).send({
      message: "Forbidden. You don't have permission to access this feature.",
    });
    return;
  }

  next();
};

export default authorizationPipe;
