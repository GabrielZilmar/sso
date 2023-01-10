import { Request } from "express";
import Joi from "joi";
import EndpointBuilder from "~services/webserver/express/utils/endpoint-builder";
import DependencyInjection from "~shared/dependency-injection";
import GetUser from "~modules/users/use-cases/get-user";
import { Http } from "~services/webserver/types";
import { UserHttpErrors } from "~modules/users/infra/http/errors";
import requestValidation from "~services/webserver/express/pipes/request-validation.pipe";
import Validator from "~shared/validator";
import { UserDTO } from "~modules/users/dto/user-dto";
import GetUserByName from "~modules/users/use-cases/get-user-by-name";

interface GetUserRequest extends Request {
  params: {
    idOrName: string;
  };
}

export default EndpointBuilder.new("/api/user/:idOrName")
  .setHttpMethod(Http.Methods.GET)
  .addPipe(
    requestValidation({
      params: Joi.object({
        idOrName: Joi.string().required(),
      }),
    })
  )
  .setHandler(async (req: GetUserRequest, res) => {
    const { idOrName } = req.params;
    let user: UserDTO;

    if (Validator.isValidUuid(idOrName)) {
      const getUser = DependencyInjection.resolve(GetUser);
      user = await getUser.execute({ id: idOrName });
    } else {
      const getUserByName = DependencyInjection.resolve(GetUserByName);
      user = await getUserByName.execute({ name: idOrName });
    }

    if (!user) {
      res.status(Http.Status.NOT_FOUND).send({
        error: UserHttpErrors.userNotFound(idOrName),
      });
      return;
    }

    res.status(Http.Status.OK).send(user);
  });
