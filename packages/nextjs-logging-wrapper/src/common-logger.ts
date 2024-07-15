import { Level, Logger } from "pino";
import { getPinoInstance } from "./shared.js";

export const REDACTED_PATHS = [];

let logger: Logger;
export const getCommonLogger = (minimumLevel?: Level): Logger => {
  if (!logger) {
    logger = getPinoInstance({
      minimumLevel,
      loggingContext: { request: {} },
      pathsToRedact: REDACTED_PATHS,
    });
  }

  return logger;
};
