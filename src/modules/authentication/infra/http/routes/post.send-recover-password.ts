import { Request } from "express";
import Joi from "joi";
import authenticationPipe from "~services/webserver/express/pipes/authentication.pipe";
import authorizationPipe from "~services/webserver/express/pipes/authorization.pipe";
import requestValidation from "~services/webserver/express/pipes/request-validation.pipe";
import EndpointBuilder from "~services/webserver/express/utils/endpoint-builder";
import { WebServerResponses } from "~services/webserver/responses";
import { Http } from "~services/webserver/types";

interface SendRecoverPasswordRequest extends Request {
  body: {
    id: string;
  };
  state: {
    token: {
      id: string;
    };
  };
}

export default EndpointBuilder.new("/api/user/send-recover-password/:userId")
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
    res.status(Http.Status.OK).send({ message: WebServerResponses.ok });
  });
