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
} from "./logging-wrapper-entities.js";
import { LogLevel, PinoLoggerOptions } from "fastify/types/logger.js";
import { LifeEventsError, isLifeEventsError } from "shared-errors";

const loggingContext: LoggingContext = {};
const UNHANDLED_EXCEPTION_CODE = "UNHANDLED_EXCEPTION";

type INPUT_ERROR_TYPES = FastifyError | LifeEventsError;

export const getLoggingContext = (params: {
  includeError: boolean;
}): LoggingContext =>
  params.includeError
    ? loggingContext
    : { ...loggingContext, error: undefined };

export const setLoggingContext = (params: {
  request?: FastifyRequest;
  response?: FastifyReply;
  error?: INPUT_ERROR_TYPES;
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

const parseErrorClass = (error: INPUT_ERROR_TYPES): LogErrorClasses => {
  let statusCode = isLifeEventsError(error)
    ? error.errorCode
    : error.statusCode;
  if (!statusCode) {
    return LogErrorClasses.UnknownError;
  }

  statusCode = Number(statusCode);

  if (statusCode === 502) {
    return LogErrorClasses.GatewayError;
  }

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

const parseLoggingError = (error: INPUT_ERROR_TYPES): LoggingError => {
  const output = {
    class: parseErrorClass(error),
    message: error.message,
    trace: error.stack,
  };

  if (isLifeEventsError(error)) {
    return { ...output, code: error.name, process: error.errorProcess };
  }

  return {
    ...output,
    code: error.code ?? UNHANDLED_EXCEPTION_CODE,
  };
};

export const getLoggerConfiguration = (
  minimumLevel: LogLevel = "debug",
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
  level: minimumLevel,
});
