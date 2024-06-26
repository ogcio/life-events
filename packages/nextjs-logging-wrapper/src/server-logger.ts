import { headers } from "next/headers.js";
import { hostname } from "os";
import { Level, Logger } from "pino";
import { REQUEST_ID_HEADER } from "shared-errors";
import { REQUEST_ID_LOG_LABEL, getPinoInstance } from "./shared.js";

export interface LoggingRequest {
  scheme: string | undefined;
  method: string | undefined;
  path: string | undefined;
  hostname: string | undefined;
  query_params: unknown | undefined;
  [key: string]: unknown;
}

export const REDACTED_PATHS = [];

let logger: Logger;
export const getServerLogger = (minimumLevel?: Level): Logger => {
  if (!logger) {
    logger = getPinoInstance({
      minimumLevel,
      loggingContext: getLoggingContext(),
      baseProperties: { hostname: hostname() },
      pathsToRedact: REDACTED_PATHS,
    });
  }

  return logger;
};

const getRequestInfo = (mappedHeaders: {
  [x: string]: unknown;
}): LoggingRequest => {
  const getHeaderAsStringIfSet = (headerName: string): string | undefined =>
    mappedHeaders[headerName] && typeof mappedHeaders[headerName] === "string"
      ? (mappedHeaders[headerName] as string)
      : undefined;

  return {
    scheme: getHeaderAsStringIfSet("x-forwarded-proto"),
    method: "GET",
    path: getHeaderAsStringIfSet("x-pathname"),
    hostname: getHeaderAsStringIfSet("host"),
    language: getHeaderAsStringIfSet("x-next-intl-locale"),
    query_params: undefined,
    user_agent: getHeaderAsStringIfSet("user-agent"),
  };
};

const getLoggingContext = (): {
  [x: string]: unknown;
  request: LoggingRequest;
} => {
  const requestHeaders = headers();
  const requestId = requestHeaders.has(REQUEST_ID_HEADER)
    ? (requestHeaders.get(REQUEST_ID_HEADER) as string)
    : crypto.randomUUID();

  const outputHeaders: { [x: string]: unknown } = {};
  requestHeaders.forEach((value, key) => {
    outputHeaders[key] = value;
  });

  return {
    [REQUEST_ID_LOG_LABEL]: requestId,
    request: getRequestInfo(outputHeaders),
  };
};
