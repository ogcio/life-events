import createError from "@fastify/error";
import { error } from "console";
import {
  FastifyError,
  FastifyRequest,
  FastifyInstance,
  FastifyReply,
} from "fastify";
import { FastifySchemaValidationError } from "fastify/types/schema.js";
import {
  parseErrorClass,
  setLoggingContext,
  getLoggingContextError,
} from "logging-wrapper/logging-wrapper";
import {
  LogErrorClasses,
  LogMessages,
} from "logging-wrapper/logging-wrapper-entities";
import { LifeEventsError, isLifeEventsError } from "shared-errors";

interface HttpError {
  code: LogErrorClasses;
  detail: string;
  request_id: string;
  name: string;
  validation?: { [fieldName: string]: string };
  process?: string;
}

const getValidationFromFastifyError = (
  validationInput: FastifySchemaValidationError[],
): { [fieldName: string]: string } => {
  const output: { [fieldName: string]: string } = {};
  for (const input of validationInput) {
    const key =
      typeof input.params?.missingProperty === "string"
        ? input.params?.missingProperty
        : input.schemaPath;
    output[key] = input.message ?? input.keyword;
  }

  return output;
};

const getResponseFromFastifyError = (
  error: FastifyError,
  request: FastifyRequest,
): HttpError => {
  const output: HttpError = {
    code: parseErrorClass(error),
    detail: error.message,
    request_id: request.id,
    name: error.name,
  };

  if (error.validation && error.validation.length > 0) {
    output.validation = getValidationFromFastifyError(error.validation);
  }

  return output;
};

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

    setErrorHeaders(error, reply);

    reply.send(getResponseFromFastifyError(error, request));
  });
};

const manageLifeEventsError = (
  error: LifeEventsError,
  request: FastifyRequest,
  reply: FastifyReply,
): void => {
  reply.raw.statusCode = error.errorCode;
  reply.statusCode = error.errorCode;

  const errorResponse: HttpError = {
    code: error.errorProcess,
    detail: error.message,
    request_id: request.id,
    name: error.name,
  };

  if (error.validation && error.validation.length > 0) {
    output.validation = getValidationFromFastifyError(error.validation);
  }

  return output;
};

// The error handler below is the same as the original one in Fastify,
// just without unwanted log entries
export const initializeNotFoundHandler = (server: FastifyInstance): void => {
  server.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    const error = createError("FST_ERR_NOT_FOUND", "Not Found", 404)();
    setLoggingContext({
      error,
    });

    request.log.error({ error: getLoggingContextError() }, LogMessages.Error);
    reply.code(404).send(buildErrorResponse(error, request));
  });
};
