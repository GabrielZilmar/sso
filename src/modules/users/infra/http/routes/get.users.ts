import { Request } from "express";
import Joi from "joi";
import GetUsers from "~modules/users/use-cases/get-users";
import requestValidation from "~services/webserver/express/pipes/request-validation.pipe";
import EndpointBuilder from "~services/webserver/express/utils/endpoint-builder";
import { Http } from "~services/webserver/types";
import DependencyInjection from "~shared/dependency-injection";

interface GetUsersRequest extends Request {
  query: {
    skip?: string;
    offset?: string;
  };
}

export default EndpointBuilder.new("/api/get-users?")
  .setHttpMethod(Http.Methods.GET)
  .addPipe(
    requestValidation({
      query: Joi.object({
        skip: Joi.number().optional().allow(0),
        offset: Joi.number().optional().allow(0),
      }),
    })
  )
  .setHandler(async (req: GetUsersRequest, res) => {
    const { skip = 0, offset = 10 } = req.query;

    const getUsers = DependencyInjection.resolve(GetUsers);

    const users = await getUsers.execute({
      skip: Number(skip),
      offset: Number(offset),
    });

    res.status(200).send(users);
  });
