import {
  FastifyReply,
  FastifyServerOptions,
  FastifyInstance,
  FastifyRequest,
} from "fastify";
import hyperid from "hyperid";
import { LogMessages, REQUEST_ID_LOG_LABEL } from "./logging-wrapper-entities";
import {
  getLoggerConfiguration,
  getLoggingContextError,
  getPartialLoggingContextError,
  parseErrorClass,
  parseFullLoggingRequest,
  resetLoggingContext,
  setLoggingContext,
} from "./logging-wrapper";
import { pino, DestinationStream } from "pino";
import createError, { FastifyError } from "@fastify/error";

const hyperidInstance = hyperid({ fixedLength: true, urlSafe: true });

const buildErrorResponse = (error: FastifyError, request: FastifyRequest) => ({
  errors: [
    {
      code: parseErrorClass(error),
      detail: error.message,
      request_id: request.id,
    },
  ],
});

// The error handler below is the same as the original one in Fastify,
// just without unwanted log entries
// I've opened an issue to fastify to ask them if we could avoid logging
// those entries when disableRequestLogging is true
// https://github.com/fastify/fastify/issues/5409
const initializeErrorHandler = (server: FastifyInstance): void => {
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
  };

  server.setErrorHandler(function (error, request, reply) {
    setErrorHeaders(error, reply);
    if (!reply.statusCode || reply.statusCode === 200) {
      const statusCode = error.statusCode ?? 500;
      reply.code(statusCode >= 400 ? statusCode : 500);
    }

    reply.send(buildErrorResponse(error, request));
  });
};

// The error handler below is the same as the original one in Fastify,
// just without unwanted log entries
const initializeNotFoundHandler = (server: FastifyInstance): void => {
  server.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    const error = createError("FST_ERR_NOT_FOUND", "Not Found", 404)();
    setLoggingContext({
      error,
    });

    request.log.error({ error: getLoggingContextError() }, LogMessages.Error);
    reply.code(404).send(buildErrorResponse(error, request));
  });
};

export const initializeLoggingHooks = (
  server: FastifyInstance,
  overrideErrorHandler: boolean = true,
): void => {
  server.addHook("preHandler", (request, _reply, done) => {
    setLoggingContext({ request });
    request.log.info(
      { request: parseFullLoggingRequest(request) },
      LogMessages.NewRequest,
    );
    done();
  });

  server.addHook("onResponse", (_req, reply, done) => {
    setLoggingContext({ response: reply });
    reply.log.info(LogMessages.Response);
    // Include error in API Track if exists
    reply.log.info(
      { error: getPartialLoggingContextError() },
      LogMessages.ApiTrack,
    );
    resetLoggingContext();
    done();
  });

  server.addHook("onError", (request, _reply, error, done) => {
    setLoggingContext({ error });

    request.log.error({ error: getLoggingContextError() }, LogMessages.Error);

    done();
  });

  if (overrideErrorHandler) {
    initializeErrorHandler(server);
    initializeNotFoundHandler(server);
  }
};

export const getLoggingConfiguration = (
  loggerDestination?: DestinationStream,
): FastifyServerOptions => ({
  logger: pino(getLoggerConfiguration(), loggerDestination),
  disableRequestLogging: true,
  genReqId: () => hyperidInstance(),
  requestIdLogLabel: REQUEST_ID_LOG_LABEL,
  requestIdHeader: false,
});
