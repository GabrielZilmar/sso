import { Request } from "express";
import Joi from "joi";
import { ACCESS_TOKEN_NAME } from "~modules/session/infra/http/routes/post.login";
import JwtService from "~services/jwt/jsonwebtoken";
import requestValidation from "~services/webserver/express/pipes/request-validation.pipe";
import EndpointBuilder from "~services/webserver/express/utils/endpoint-builder";
import { WebServerResponses } from "~services/webserver/responses";
import { Http } from "~services/webserver/types";
import DependencyInjection from "~shared/dependency-injection";

interface RedirectRequest extends Request {
  query: {
    redirectUrl: string;
  };
}

export default EndpointBuilder.new("/api/session/redirect")
  .setHttpMethod(Http.Methods.GET)
  .addPipe(
    requestValidation({
      query: Joi.object({
        redirectUrl: Joi.string().uri().required(),
      }),
    })
  )
  .setHandler(async (req: RedirectRequest, res) => {
    const { redirectUrl } = req.query;
    const accessToken = req.cookies[ACCESS_TOKEN_NAME];

    if (!accessToken) {
      res
        .status(Http.Status.FORBIDDEN)
        .send({ message: WebServerResponses.invalidToken });
      return;
    }

    try {
      const jwtService = DependencyInjection.resolve(JwtService);
      jwtService.decodeToken(accessToken);
      res.status(Http.Status.REDIRECT).redirect(redirectUrl);
    } catch (err) {
      res
        .status(Http.Status.FORBIDDEN)
        .send({ message: WebServerResponses.invalidToken });
    }
  });
