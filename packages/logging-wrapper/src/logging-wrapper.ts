import { FastifyRequest, FastifyReply, FastifyError } from "fastify";
import { hostname } from "os";
import {
  LoggingContext,
  LoggingRequest,
  FullLoggingRequest,
  LoggingResponse,
  LogErrorClasses,
  LoggingError,
  REDACTED_VALUE,
  REDACTED_PATHS,
  MESSAGE_KEY,
} from "./logging-wrapper-entities";
import { LogLevel, PinoLoggerOptions } from "fastify/types/logger";

const loggingContext: LoggingContext = {};

export const getLoggingContext = (params: {
  includeError: boolean;
}): LoggingContext =>
  params.includeError
    ? loggingContext
    : { ...loggingContext, error: undefined };

export const setLoggingContext = (params: {
  request?: FastifyRequest;
  response?: FastifyReply;
  error?: FastifyError;
}): void => {
  if (params.request !== undefined) {
    loggingContext.request = parseLoggingRequest(params.request);
  }
  if (params.response !== undefined) {
    loggingContext.response = parseLoggingResponse(params.response);
  }
  if (params.error !== undefined) {
    loggingContext.error = parseLoggingError(params.error);
  }
};

export const resetLoggingContext = (): void => {
  loggingContext.request = undefined;
  loggingContext.response = undefined;
  loggingContext.error = undefined;
};

export const getLoggingContextError = (): LoggingError | undefined =>
  getLoggingContext({ includeError: true }).error;

export const getPartialLoggingContextError = ():
  | Omit<LoggingError, "trace">
  | undefined => ({
  ...(getLoggingContext({ includeError: true }).error ?? {}),
  trace: undefined,
});

const getPathWithoutParams = (req: FastifyRequest): string =>
  req.routeOptions?.url ?? req.url.split("?")[0];

const parseLoggingRequest = (req: FastifyRequest): LoggingRequest => ({
  scheme: req.protocol,
  method: req.method,
  path: getPathWithoutParams(req),
  hostname: req.hostname,
  query_params: req.query,
});

export const parseFullLoggingRequest = (
  req: FastifyRequest,
): FullLoggingRequest => ({
  ...parseLoggingRequest(req),
  headers: req.headers,
  client_ip: req.ip,
  user_agent: req.headers["user-agent"] ?? undefined,
});

const parseLoggingResponse = (res: FastifyReply): LoggingResponse => ({
  status_code: res.statusCode,
  headers: res.getHeaders(),
});

export const parseErrorClass = (error: FastifyError): LogErrorClasses => {
  // TODO Implement the management of GATEWAY_ERROR

  if (!error.statusCode) {
    return LogErrorClasses.UnknownError;
  }
  const statusCode = Number(error.statusCode);

  if (statusCode >= 500) {
    return LogErrorClasses.ServerError;
  }
  if (statusCode === 422) {
    return LogErrorClasses.ValidationError;
  }
  if (statusCode >= 400) {
    return LogErrorClasses.RequestError;
  }

  return LogErrorClasses.UnknownError;
};

const parseLoggingError = (error: FastifyError): LoggingError => ({
  class: parseErrorClass(error),
  message: error.message,
  trace: error.stack,
  code: error.code,
});

export const getLoggerConfiguration = (
  mininumLevel: LogLevel = "debug",
): PinoLoggerOptions => ({
  base: { hostname: hostname() },
  messageKey: MESSAGE_KEY,
  mixin: () => ({
    timestamp: Date.now(),
    ...getLoggingContext({ includeError: false }),
  }),
  redact: {
    paths: REDACTED_PATHS,
    censor: REDACTED_VALUE,
  },
  timestamp: false,
  formatters: {
    level: (name: string, levelVal: number) => ({
      level: levelVal,
      level_name: name.toUpperCase(),
    }),
  },
  level: mininumLevel,
});
