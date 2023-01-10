import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { IPipe } from "~services/webserver/express/utils/endpoint-builder";
import { Http } from "~services/webserver/types";

type schemaCriteria = {
  header?: Joi.AnySchema;
  params?: Joi.AnySchema;
  query?: Joi.AnySchema;
  body?: Joi.AnySchema;
};

const validateObject = (
  object: Record<string, unknown>,
  schema: Joi.AnySchema,
  res: Response
): void => {
  const { error } = schema.validate(object);

  if (error) {
    res.status(Http.Status.BAD_REQUEST).send(error);
    throw new Error(`Invalid request.`);
  }
};

const requestValidation =
  (criteria: schemaCriteria): IPipe =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      Object.entries(criteria).forEach(([key, schema]) => {
        const conditions = {
          headers: () => validateObject(req.headers, schema, res),
          params: () => validateObject(req.params, schema, res),
          query: () => validateObject(req.query, schema, res),
          body: () => validateObject(req.body, schema, res),
        };

        conditions[key]();
      });
    } catch (error) {
      return;
    }

    next();
  };

export default requestValidation;
