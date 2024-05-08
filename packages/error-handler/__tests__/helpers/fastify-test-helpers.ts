import { FastifyInstance } from "fastify";
import { buildFastify } from "./build-fastify.js";
export const DEFAULT_HOSTNAME = "localhost:80";
export const DEFAULT_USER_AGENT = "lightMyRequest";
export const DEFAULT_REQUEST_HEADERS = {
  "user-agent": "lightMyRequest",
  host: "localhost:80",
};
export const DEFAULT_CLIENT_IP = "127.0.0.1";
export const DEFAULT_CONTENT_TYPE = "application/json; charset=utf-8";
export const DEFAULT_METHOD = "GET";
export const DEFAULT_SCHEME = "http";
export const DEFAULT_PATH = "/error";

export interface TestingLoggerDestination {
  loggerDestination: {
    write: (_data: string) => number;
  };
  getLoggedRecords: () => string[];
}

export const getTestingDestinationLogger = (): TestingLoggerDestination => {
  const testCaseRecords: string[] = [];
  const getLoggedRecords = () => testCaseRecords;
  const loggerDestination = {
    write: (data: string) => testCaseRecords.push(data),
  };

  return { loggerDestination, getLoggedRecords };
};

export const initializeServer = (): {
  server: FastifyInstance;
  loggingDestination: TestingLoggerDestination;
} => {
  const loggingDestination = getTestingDestinationLogger();
  const server = buildFastify(loggingDestination.loggerDestination);

  return { server, loggingDestination };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseLogEntry = (logEntry: string): { [x: string]: any } =>
  JSON.parse(logEntry);
