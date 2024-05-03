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
