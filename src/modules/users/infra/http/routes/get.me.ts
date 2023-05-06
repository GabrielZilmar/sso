import { Request } from "express";
import EndpointBuilder from "~services/webserver/express/utils/endpoint-builder";
import { Http } from "~services/webserver/types";
import { UserDTO } from "~modules/users/dto/user-dto";
import authenticationPipe from "~services/webserver/express/pipes/authentication.pipe";
import DependencyInjection from "~shared/dependency-injection";
import GetUser from "~modules/users/use-cases/get-user";
import { UserHttpErrors } from "~modules/users/infra/http/errors";

interface GetMeRequest extends Request {
  state: {
    token: UserDTO;
  };
}

export default EndpointBuilder.new("/api/me")
  .setHttpMethod(Http.Methods.GET)
  .addPipe(authenticationPipe)
  .setHandler(async (req: GetMeRequest, res) => {
    const { token } = req.state;

    const getUser = DependencyInjection.resolve(GetUser);
    const user = await getUser.execute({ id: token.id });

    if (!user) {
      res.status(Http.Status.NOT_FOUND).send({
        error: UserHttpErrors.userNotFound(token.id),
      });
      return;
    }

    res.status(Http.Status.OK).send(user);
  });
