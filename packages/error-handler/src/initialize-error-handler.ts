import {
  FastifyError,
  FastifyRequest,
  FastifyInstance,
  FastifyReply,
} from "fastify";
import { FastifySchemaValidationError } from "fastify/types/schema.js";
import {
  setLoggingContext,
  getLoggingContextError,
} from "logging-wrapper/logging-wrapper";
import { LogMessages } from "logging-wrapper/logging-wrapper-entities";
import {
  HttpErrorClasses,
  LifeEventsError,
  NotFoundError,
  ValidationError,
  ValidationErrorData,
  isLifeEventsError,
  isValidationLifeEventsError,
  parseHttpErrorClass,
} from "shared-errors";

export interface HttpError {
  code: HttpErrorClasses;
  detail: string;
  requestId: string;
  name: string;
  validation?: ValidationErrorData[];
  process?: string;
}

// The error handler below is the same as the original one in Fastify,
// just without unwanted log entries
// I've opened an issue to fastify to ask them if we could avoid logging
// those entries when disableRequestLogging is true
// https://github.com/fastify/fastify/issues/5409
export const setupErrorHandler = (server: FastifyInstance): void => {
  const setErrorHeaders = (
    error: null | {
      headers?: { [x: string]: string | number | string[] | undefined };
      status?: number;
      statusCode?: number;
    },
    reply: FastifyReply,
  ) => {
    const res = reply.raw;
    let statusCode = res.statusCode;
    statusCode = statusCode >= 400 ? statusCode : 500;
    // treat undefined and null as same
    if (error != null) {
      if (error.headers !== undefined) {
        reply.headers(error.headers);
      }
      if (error.status && error.status >= 400) {
        statusCode = error.status;
      } else if (error.statusCode && error.statusCode >= 400) {
        statusCode = error.statusCode;
      }
    }
    res.statusCode = statusCode;
    reply.statusCode = res.statusCode;
  };

  server.setErrorHandler(function (error, request, reply) {
    if (isLifeEventsError(error)) {
      manageLifeEventsError(error, request, reply);
      return;
    }

    if (error.validation) {
      const lifeEventsError = toLifeEventsValidationError(error, request);
      manageLifeEventsError(lifeEventsError, request, reply);
      return;
    }

    setErrorHeaders(error, reply);
    reply.send(getResponseFromFastifyError(error, request));
  });
};

// The error handler below is the same as the original one in Fastify,
// just without unwanted log entries
export const initializeNotFoundHandler = (server: FastifyInstance): void => {
  server.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    const error = new NotFoundError(request.url, "Route not found");
    setLoggingContext({
      error,
    });

    request.log.error({ error: getLoggingContextError() }, LogMessages.Error);
    manageLifeEventsError(error, request, reply);
  });
};

const getValidationFromFastifyError = (
  validationInput: FastifySchemaValidationError[],
): ValidationErrorData[] => {
  const output: ValidationErrorData[] = [];
  for (const input of validationInput) {
    const key =
      input.params?.missingProperty ?? input.instancePath.split("/").pop();
    const message = input.message ?? input.keyword;
    if (key && typeof key === "string") {
      output.push({
        fieldName: key,
        message,
        validationRule: input.keyword,
        additionalInfo: input.params,
      });
      continue;
    }

    output.push({
      fieldName: input.schemaPath,
      message,
      validationRule: input.keyword,
      additionalInfo: input.params,
    });
  }

  return output;
};

const getResponseFromFastifyError = (
  error: FastifyError,
  request: FastifyRequest,
): HttpError => {
  const output: HttpError = {
    code: parseHttpErrorClass(error.statusCode),
    detail: error.message,
    requestId: request.id,
    name: error.name,
  };

  if (error.validation && error.validation.length > 0) {
    output.validation = getValidationFromFastifyError(error.validation);
  }

  return output;
};

const manageLifeEventsError = (
  error: LifeEventsError,
  request: FastifyRequest,
  reply: FastifyReply,
): void => {
  reply.raw.statusCode = error.errorCode;
  reply.statusCode = error.errorCode;

  const errorResponse: HttpError = {
    code: parseHttpErrorClass(error.errorCode),
    detail: error.message,
    requestId: request.id,
    name: error.name,
    process: error.errorProcess,
  };

  if (
    isValidationLifeEventsError(error) &&
    error.validationErrors &&
    Object.keys(error.validationErrors).length > 0
  ) {
    errorResponse.validation = error.validationErrors;
  }

  reply.status(error.errorCode).send(errorResponse);
};

const toLifeEventsValidationError = (
  error: FastifyError,
  request: FastifyRequest,
): ValidationError => {
  if (!error.validation) {
    throw new LifeEventsError(
      "ERROR_HANDLER_SETUP",
      "This is not a validation error",
    );
  }

  return new ValidationError(
    request.url,
    error.message,
    getValidationFromFastifyError(error.validation),
  );
};
