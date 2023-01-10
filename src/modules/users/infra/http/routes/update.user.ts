import { Request } from "express";
import Joi from "joi";
import UpdateUser from "~modules/users/use-cases/update-user";
import requestValidation from "~services/webserver/express/pipes/request-validation.pipe";
import EndpointBuilder from "~services/webserver/express/utils/endpoint-builder";
import { Http } from "~services/webserver/types";
import DependencyInjection from "~shared/dependency-injection";

interface UpdateUserRequest extends Request {
  params: {
    id: string;
  };
  body: {
    name: string;
  };
}

export default EndpointBuilder.new("/api/user/:id")
  .setHttpMethod(Http.Methods.PUT)
  .addPipe(
    requestValidation({
      params: Joi.object({
        id: Joi.string().uuid().required(),
      }),
      body: Joi.object({
        name: Joi.string().required(),
      }),
    })
  )
  .setHandler(async (req: UpdateUserRequest, res) => {
    const { id } = req.params;
    const { name } = req.body;

    const updateUser = DependencyInjection.resolve(UpdateUser);

    const userUpdated = await updateUser.execute({ id, user: { name } });

    if (userUpdated.isLeft()) {
      const status = userUpdated.value.status;

      res.status(status).send({ error: userUpdated.value.message });
      return;
    }

    res.status(Http.Status.OK).send(userUpdated);
  });
