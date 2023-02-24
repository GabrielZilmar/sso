import { Request } from "express";
import Joi from "joi";
import LoginUseCase from "~modules/session/use-case/login";
import requestValidation from "~services/webserver/express/pipes/request-validation.pipe";
import EndpointBuilder from "~services/webserver/express/utils/endpoint-builder";
import { Http } from "~services/webserver/types";
import DependencyInjection from "~shared/dependency-injection";

const ACCESS_TOKEN_NAME = "access-token";
const ONE_DAY = 86400 * 1000;

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

export default EndpointBuilder.new("/api/login")
  .setHttpMethod(Http.Methods.POST)
  .addPipe(
    requestValidation({
      body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
      }),
    })
  )
  .setHandler(async (req: LoginRequest, res) => {
    const { body: loginData } = req;

    const loginUseCase = DependencyInjection.resolve(LoginUseCase);
    const userAuthenticatedOrError = await loginUseCase.execute(loginData);

    if (userAuthenticatedOrError.isLeft()) {
      const statusError = userAuthenticatedOrError.value.status;
      const messageError = userAuthenticatedOrError.value.message;

      res.status(statusError).send({ error: messageError });
      return;
    }

    res.cookie(ACCESS_TOKEN_NAME, userAuthenticatedOrError.value.accessToken, {
      maxAge: ONE_DAY,
      httpOnly: true, // http only, prevents JavaScript cookie access
      secure: true, // cookie must be sent over https / ssl
    });
    res.status(Http.Status.OK).send(userAuthenticatedOrError.value);
  });
