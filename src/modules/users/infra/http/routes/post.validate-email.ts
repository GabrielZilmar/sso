import { Request } from "express";
import Joi from "joi";
import { UserDTO } from "~modules/users/dto/user-dto";
import AuthEmail from "~modules/users/use-cases/auth-email";
import authenticationPipe from "~services/webserver/express/pipes/authentication.pipe";
import authorizationPipe from "~services/webserver/express/pipes/authorization.pipe";
import requestValidation from "~services/webserver/express/pipes/request-validation.pipe";
import EndpointBuilder from "~services/webserver/express/utils/endpoint-builder";
import { WebServerResponses } from "~services/webserver/responses";
import { Http } from "~services/webserver/types";
import DependencyInjection from "~shared/dependency-injection";

interface SendEmailValidateRequest extends Request {
  body: {
    id: string;
  };
  state: {
    token: UserDTO;
  };
}

export default EndpointBuilder.new("/api/user/auth-email")
  .setHttpMethod(Http.Methods.POST)
  .addPipe([
    requestValidation({
      body: Joi.object({
        id: Joi.string().uuid().required(),
      }),
    }),
    authenticationPipe,
    authorizationPipe,
  ])
  .setHandler(async (req: SendEmailValidateRequest, res) => {
    const { id } = req.body;
    const { authorization: token } = req.headers;

    const authEmail = DependencyInjection.resolve(AuthEmail);
    const authEmailOrError = await authEmail.execute({
      id,
      decryptedToken: token as string,
    });

    if (authEmailOrError.isLeft()) {
      const statusError = authEmailOrError.value.status;
      const messageError = authEmailOrError.value.message;

      res.status(statusError).send({ error: messageError });
      return;
    }

    res.status(Http.Status.OK).send({ message: WebServerResponses.ok });
  });
