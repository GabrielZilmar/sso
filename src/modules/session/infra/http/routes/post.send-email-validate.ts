import { Request } from "express";
import Joi from "joi";
import SendValidateEmail from "~modules/session/use-case/send-validate-email";
import { UserDTO } from "~modules/users/dto/user-dto";
import authenticationPipe from "~services/webserver/express/pipes/authentication.pipe";
import authorizationPipe from "~services/webserver/express/pipes/authorization.pipe";
import requestValidation from "~services/webserver/express/pipes/request-validation.pipe";
import EndpointBuilder from "~services/webserver/express/utils/endpoint-builder";
import { WebServerResponses } from "~services/webserver/responses";
import { Http } from "~services/webserver/types";
import DependencyInjection from "~shared/dependency-injection";

interface SendEmailValidateRequest extends Request {
  body: {
    email: string;
  };
  state: {
    token: UserDTO;
  };
}

export default EndpointBuilder.new("/api/authentication/user-email")
  .setHttpMethod(Http.Methods.POST)
  .addPipe([
    requestValidation({
      body: Joi.object({
        email: Joi.string().email().required(),
      }),
    }),
    authenticationPipe,
    authorizationPipe,
  ])
  .setHandler(async (req: SendEmailValidateRequest, res) => {
    const { email } = req.body;

    const sendValidateEmail = DependencyInjection.resolve(SendValidateEmail);
    const sentEmailOrError = await sendValidateEmail.execute({
      email,
    });

    if (sentEmailOrError.isLeft()) {
      const statusError = sentEmailOrError.value.status;
      const messageError = sentEmailOrError.value.message;

      res.status(statusError).send({ error: messageError });
      return;
    }

    res.status(Http.Status.OK).send({ message: WebServerResponses.ok });
  });
