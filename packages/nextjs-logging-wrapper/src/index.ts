import { hostname } from "os";
import { pino, Level, LoggerOptions, Logger, levels } from "pino";

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

//const UNHANDLED_EXCEPTION_CODE = "UNHANDLED_EXCEPTION";
let logger: Logger;
export const getLogger = (minimumLevel?: Level): Logger => {
  if (!logger) {
    const toCheckLevel = minimumLevel ?? process.env.LOG_LEVEL;
    const level = isValidLevel(toCheckLevel) ? toCheckLevel : "debug";
    logger = pino(getLoggerConfiguration(level));
  }

  return logger;
};

export const getLoggerConfiguration = (
  minimumLevel: Level = "debug",
): LoggerOptions => ({
  base: { hostname: hostname() },
  messageKey: MESSAGE_KEY,
  mixin: () => ({
    timestamp: Date.now(),
    //...getLoggingContext({ includeError: false }),
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

const isValidLevel = (level: string | undefined): level is Level =>
  level !== undefined && Object.keys(levels.values).includes(level);
