import createError from "@fastify/error";
import {
  FastifyError,
  FastifyRequest,
  FastifyInstance,
  FastifyReply,
} from "fastify";
import {
  parseErrorClass,
  setLoggingContext,
  getLoggingContextError,
} from "logging-wrapper/src/logging-wrapper";
import { LogMessages } from "logging-wrapper/src/logging-wrapper-entities";

const buildErrorResponse = (error: FastifyError, request: FastifyRequest) => ({
  code: parseErrorClass(error),
  detail: error.message,
  request_id: request.id,
  name: error.name,
  validation: error.validation,
  validationContext: error.validationContext,
});

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
    setErrorHeaders(error, reply);

    reply.send(buildErrorResponse(error, request));
  });
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
