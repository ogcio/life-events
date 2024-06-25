import { pino, Level, LoggerOptions, levels, Logger } from "pino";

export const getPinoInstance = (params: {
  getConfigurations: (minimumLevel: Level) => LoggerOptions;
  minLevel?: Level;
}): Logger => {
  const toCheckLevel = params.minLevel ?? process.env.LOG_LEVEL;
  const level = isValidLevel(toCheckLevel) ? toCheckLevel : "debug";

  return pino(params.getConfigurations(level));
};

const isValidLevel = (level: string | undefined): level is Level =>
  level !== undefined && Object.keys(levels.values).includes(level);

export const MESSAGE_KEY = "message";

export const REQUEST_ID_LOG_LABEL = "request_id";

export const REDACTED_VALUE = "[redacted]";
