"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestingDestinationLogger = exports.buildLogger = void 0;
const pino_1 = require("pino");
const buildLogger = (loggerConfiguration) => {
  const { loggerDestination, getLoggedRecords } = (0,
  exports.getTestingDestinationLogger)();
  return {
    logger: (0, pino_1.pino)(loggerConfiguration, loggerDestination),
    loggedRecordsMethod: getLoggedRecords,
  };
};
exports.buildLogger = buildLogger;
const getTestingDestinationLogger = () => {
  const testCaseRecords = [];
  const getLoggedRecords = () => testCaseRecords;
  const loggerDestination = {
    write: (data) => testCaseRecords.push(data),
  };
  return { loggerDestination, getLoggedRecords };
};
exports.getTestingDestinationLogger = getTestingDestinationLogger;
