import { Request } from "express";
import Joi from "joi";
import CreateUser from "~modules/users/use-cases/create-user";
import requestValidation from "~services/webserver/express/pipes/request-validation.pipe";
import EndpointBuilder from "~services/webserver/express/utils/endpoint-builder";
import { Http } from "~services/webserver/types";
import DependencyInjection from "~shared/dependency-injection";

interface CreateUserRequest extends Request {
  email: string;
  name: string;
  password: string;
}

export default EndpointBuilder.new("/api/user")
  .setHttpMethod(Http.Methods.POST)
  .addPipe(
    requestValidation({
      body: Joi.object({
        email: Joi.string().email().required(),
        name: Joi.string().required(),
        password: Joi.string().required(),
      }),
    })
  )
  .setHandler(async (req: CreateUserRequest, res) => {
    const { email, name, password } = req.body;

    const createdUser = DependencyInjection.resolve(CreateUser);

    const userOrError = await createdUser.execute({ email, name, password });
    if (userOrError.isLeft()) {
      const status = userOrError.value.status;

      res.status(status).send({ error: userOrError.value.message });
      return;
    }

    res.status(Http.Status.OK).send(userOrError.value);
  });
