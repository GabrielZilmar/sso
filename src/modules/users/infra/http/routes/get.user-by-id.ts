import { Request } from "express";
import Joi from "joi";
import EndpointBuilder from "~services/webserver/express/utils/endpoint-builder";
import DependencyInjection from "~shared/dependency-injection";
import GetUser from "~modules/users/use-cases/get-user";
import { Http } from "~services/webserver/types";
import { UserHttpErrors } from "~modules/users/infra/http/errors";
import requestValidation from "~services/webserver/express/pipes/request-validation.pipe";

interface GetUserRequest extends Request {
  params: {
    id: string;
  };
}

export default EndpointBuilder.new("/api/get-user/:id")
  .setHttpMethod(Http.Methods.GET)
  .addPipe(
    requestValidation({
      params: Joi.object({
        id: Joi.string(),
      }),
    })
  )
  .setHandler(async (req: GetUserRequest, res) => {
    const { id } = req.params;
    const getUser = DependencyInjection.resolve(GetUser);

    const user = await getUser.execute({ id });

    if (!user) {
      res.status(Http.Status.NOT_FOUND).send({
        error: UserHttpErrors.userNotFound(id),
      });
    }

    res.status(Http.Status.OK).send(user);
  });
