import { Request } from "express";
import Joi from "joi";
import SendRecoverPasswordEmail from "~modules/session/use-case/send-recover-password-email";
import authenticationPipe from "~services/webserver/express/pipes/authentication.pipe";
import authorizationPipe from "~services/webserver/express/pipes/authorization.pipe";
import requestValidation from "~services/webserver/express/pipes/request-validation.pipe";
import EndpointBuilder from "~services/webserver/express/utils/endpoint-builder";
import { WebServerResponses } from "~services/webserver/responses";
import { Http } from "~services/webserver/types";
import DependencyInjection from "~shared/dependency-injection";

interface SendRecoverPasswordRequest extends Request {
  params: {
    userId: string;
  };
  body: {
    password: string;
  };
  state: {
    token: {
      id: string;
    };
  };
}

export default EndpointBuilder.new(
  "/api/authentication/send-recover-password/:userId"
)
  .setHttpMethod(Http.Methods.POST)
  .addPipe([
    requestValidation({
      body: Joi.object({
        password: Joi.string().required(),
      }),
    }),
    authenticationPipe,
    authorizationPipe,
  ])
  .setHandler(async (req: SendRecoverPasswordRequest, res) => {
    const { userId } = req.params;
    const { password } = req.body;

    const sendRecoverPasswordEmail = DependencyInjection.resolve(
      SendRecoverPasswordEmail
    );
    const sentEmailOrError = await sendRecoverPasswordEmail.execute({
      userId,
      password,
    });

    if (sentEmailOrError.isLeft()) {
      const statusError = sentEmailOrError.value.status;
      const messageError = sentEmailOrError.value.message;

      res.status(statusError).send({ error: messageError });
      return;
    }

    res.status(Http.Status.OK).send({ message: WebServerResponses.ok });
  });
