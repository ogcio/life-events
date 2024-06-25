import { Level, LoggerOptions, Logger } from "pino";
import { MESSAGE_KEY, REDACTED_VALUE, getPinoInstance } from "./shared.js";
import { useParams, usePathname, useSearchParams } from "next/navigation.js";

export const REDACTED_PATHS = [];

let logger: Logger;
export const getClientLogger = (minimumLevel?: Level): Logger => {
  if (!logger) {
    logger = getPinoInstance({
      getConfigurations: getLoggerConfiguration,
      minLevel: minimumLevel,
    });
  }

  return logger;
};

export const getLoggerConfiguration = (
  minimumLevel: Level = "debug",
): LoggerOptions => {
  return {
    base: {},
    messageKey: MESSAGE_KEY,
    mixin: () => ({
      timestamp: Date.now(),
      ...getLoggingContext(),
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
  };
};

interface ClientLoggingRequest {
  params: { [x: string]: string };
  path: string;
  query_params: { [x: string]: string };
}

const getLoggingContext = (): {
  [x: string]: unknown;
  request: ClientLoggingRequest;
} => {
  const search: { [x: string]: string } = {};
  useSearchParams().forEach((value, key) => {
    search[key] = value;
  });

  return {
    request: { path: usePathname(), params: useParams(), query_params: search },
  };
};
