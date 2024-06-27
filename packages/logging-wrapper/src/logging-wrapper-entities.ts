import { FastifyError } from "fastify";
import { LifeEventsError, isLifeEventsError } from "shared-errors";

export interface LoggingRequest {
  scheme: string;
  method: string;
  path: string | undefined;
  hostname: string;
  query_params: unknown;
  [key: string]: unknown;
}

export interface FullLoggingRequest extends LoggingRequest {
  headers: unknown;
  user_agent: string | undefined;
  client_ip: string;
}

export interface LoggingResponse {
  headers: unknown;
  status_code: number;
  [key: string]: unknown;
}

export interface LoggingError {
  class: LogErrorClasses;
  message: string;
  trace?: string;
  [key: string]: unknown;
}

export interface LoggingContext {
  request?: LoggingRequest;
  response?: LoggingResponse;
  error?: LoggingError;
}

export enum LogMessages {
  NewRequest = "NEW_REQUEST",
  Response = "RESPONSE",
  Error = "ERROR",
  ApiTrack = "API_TRACK",
}

export enum LogErrorClasses {
  ServerError = "SERVER_ERROR",
  ValidationError = "VALIDATION_ERROR",
  RequestError = "REQUEST_ERROR",
  GatewayError = "GATEWAY_ERROR",
  UnknownError = "UNKNOWN_ERROR",
}

export const REDACTED_VALUE = "[redacted]";

export const REDACTED_PATHS = [
  '*.headers["x-amz-security-token"]',
  '*.headers["x-api-key"]',
  '*.headers["authorization"]',
  '*.headers["cookie"]',
  '*.headers["set-cookie"]',
  '*.headers["proxy-authorization"]',
];

export const MESSAGE_KEY = "message";

export const REQUEST_ID_LOG_LABEL = "request_id";

const UNHANDLED_EXCEPTION_CODE = "UNHANDLED_EXCEPTION";

export const toLoggingError = (
  error: LifeEventsError | FastifyError,
): LoggingError => {
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

const parseErrorClass = (
  error: FastifyError | LifeEventsError,
): LogErrorClasses => {
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
