import { PinoLoggerOptions } from "fastify/types/logger";
import { pino } from "pino";

export const buildLogger = (loggerConfiguration: PinoLoggerOptions) => {
  const { loggerDestination, getLoggedRecords } = getTestingDestinationLogger();

  return {
    logger: pino(loggerConfiguration, loggerDestination),
    loggedRecordsMethod: getLoggedRecords,
  };
};

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
