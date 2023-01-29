import { UserDTO } from "~modules/users/dto/user-dto";
import { IPipe } from "~services/webserver/express/utils/endpoint-builder";
import { Http } from "~services/webserver/types";

const isAdminPipe: IPipe = (req, res, next): void => {
  const { token } = req.state as {
    token: UserDTO;
  };
  const { isAdmin } = token;

  if (!isAdmin) {
    res.status(Http.Status.FORBIDDEN).send({
      message:
        "You don't have permission to access this feature, it's exclusive for admins.",
    });
    return;
  }

  next();
};

export default isAdminPipe;
