import { Level, Logger } from "pino";
import { getPinoInstance } from "./shared.js";
import { useParams, usePathname, useSearchParams } from "next/navigation.js";

export const REDACTED_PATHS = [];

let logger: Logger;
export const getClientLogger = (minimumLevel?: Level): Logger => {
  if (!logger) {
    logger = getPinoInstance({
      minimumLevel,
      loggingContext: getLoggingContext(),
      pathsToRedact: REDACTED_PATHS,
    });
  }

  return logger;
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
