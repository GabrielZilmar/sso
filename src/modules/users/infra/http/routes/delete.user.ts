import { Request } from "express";
import Joi from "joi";
import DeleteUser from "~modules/users/use-cases/delete-user";
import { WebServerResponses } from "~services/webserver/responses";
import requestValidation from "~services/webserver/express/pipes/request-validation.pipe";
import EndpointBuilder from "~services/webserver/express/utils/endpoint-builder";
import { Http } from "~services/webserver/types";
import DependencyInjection from "~shared/dependency-injection";

interface DeleteUserRequest extends Request {
  params: {
    id: string;
  };
}

export default EndpointBuilder.new("/api/user/:id")
  .setHttpMethod(Http.Methods.DELETE)
  .addPipe(
    requestValidation({
      params: Joi.object({
        id: Joi.string().uuid().required(),
      }),
    })
  )
  .setHandler(async (req: DeleteUserRequest, res) => {
    const { id } = req.params;

    const deleteUser = DependencyInjection.resolve(DeleteUser);

    const userHasDeleted = await deleteUser.execute({ id });

    if (userHasDeleted.isLeft()) {
      const status = userHasDeleted.value.status;

      res.status(status).send({
        error: userHasDeleted.value.message,
      });
      return;
    }

    if (!userHasDeleted.value) {
      res
        .status(Http.Status.INTERNAL_SERVER_ERROR)
        .send({ message: WebServerResponses.internalError });
      return;
    }

    res.status(Http.Status.OK).send({ message: WebServerResponses.ok });
  });
