import { Request } from "express";
import Joi from "joi";
import EndpointBuilder from "~services/webserver/express/utils/endpoint-builder";
import { Http } from "~services/webserver/types";
import requestValidation from "~services/webserver/express/pipes/request-validation.pipe";
import authenticationPipe from "~services/webserver/express/pipes/authentication.pipe";
import authorizationPipe from "~services/webserver/express/pipes/authorization.pipe";
import { WebServerResponses } from "~services/webserver/responses";
import DependencyInjection from "~shared/dependency-injection";
import UpdatePassword from "~modules/users/use-cases/update-password";
import TokenType from "~modules/token/domain/value-objects/type";

interface SendEmailValidateRequest extends Request {
  body: {
    id: string;
    currentPassword: string;
    newPassword: string;
    passwordConfirm: string;
  };
  state: {
    token: {
      userId: string;
      type: TokenType;
    };
  };
}

export default EndpointBuilder.new("/api/user/recover-password")
  .setHttpMethod(Http.Methods.POST)
  .addPipe([
    requestValidation({
      body: Joi.object({
        id: Joi.string().uuid().required(),
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().required(),
        passwordConfirm: Joi.string().valid(Joi.ref("newPassword")).required(),
      }),
    }),
    authenticationPipe,
    authorizationPipe,
  ])
  .setHandler(async (req: SendEmailValidateRequest, res) => {
    const { id, currentPassword, newPassword } = req.body;
    const { authorization: token } = req.headers;

    const updatePassword = DependencyInjection.resolve(UpdatePassword);
    const updatedPasswordOrError = await updatePassword.execute({
      id,
      currentPassword,
      newPassword,
      decryptedToken: token as string,
    });

    if (updatedPasswordOrError.isLeft()) {
      const statusError = updatedPasswordOrError.value.status;
      const messageError = updatedPasswordOrError.value.message;

      res.status(statusError).send({ error: messageError });
      return;
    }

    res.status(Http.Status.OK).send({ message: WebServerResponses.ok });
  });
