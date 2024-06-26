import { pino, Level, LoggerOptions, levels, Logger } from "pino";

export const MESSAGE_KEY = "message";

export const REQUEST_ID_LOG_LABEL = "request_id";

export const REDACTED_VALUE = "[redacted]";

export const getPinoInstance = <T>(params: {
  pathsToRedact: string[];
  baseProperties?: { [x: string]: string };
  loggingContext: {
    [x: string]: unknown;
    request: T;
  };
  minimumLevel?: Level;
}): Logger => {
  const toCheckLevel = params.minimumLevel ?? process.env.LOG_LEVEL;
  const level = isValidLevel(toCheckLevel) ? toCheckLevel : "debug";

  return pino(getLoggerConfiguration({ ...params, minimumLevel: level }));
};

const isValidLevel = (level: string | undefined): level is Level =>
  level !== undefined && Object.keys(levels.values).includes(level);

const getLoggerConfiguration = <T>(params: {
  minimumLevel: Level;
  pathsToRedact: string[];
  baseProperties?: { [x: string]: string };
  loggingContext: {
    [x: string]: unknown;
    request: T;
  };
}): LoggerOptions => ({
  base: params.baseProperties,
  messageKey: MESSAGE_KEY,
  mixin: () => ({
    timestamp: Date.now(),
    ...params.loggingContext,
  }),
  redact: {
    paths: params.pathsToRedact,
    censor: REDACTED_VALUE,
  },
  timestamp: false,
  formatters: {
    level: (name: string, levelVal: number) => ({
      level: levelVal,
      level_name: name.toUpperCase(),
    }),
  },
  level: params.minimumLevel,
});
