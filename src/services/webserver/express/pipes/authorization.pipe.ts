import { UserDTO } from "~modules/users/dto/user-dto";
import { IPipe } from "~services/webserver/express/utils/endpoint-builder";
import { Http } from "~services/webserver/types";

const authorizationPipe: IPipe = (req, res, next): void => {
  const { body } = req;
  const { token } = req.state as {
    token: UserDTO;
  };

  const { isAdmin } = token;
  if (isAdmin) {
    next();
    return;
  }

  const canAccess = Object.keys(body).every((item) => {
    if (token[item]) {
      return token[item] === body[item];
    }
    return true;
  });

  if (!canAccess) {
    res.status(Http.Status.FORBIDDEN).send({
      message: "Forbidden. You don't have permission to access this feature.",
    });
    return;
  }

  next();
};

export default authorizationPipe;
