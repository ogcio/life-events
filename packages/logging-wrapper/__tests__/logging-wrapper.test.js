"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const tap_1 = __importDefault(require("tap"));
const logging_wrapper_1 = require("../src/logging-wrapper");
const build_logger_1 = require("./helpers/build-logger");
const os_1 = require("os");
const logging_wrapper_entities_1 = require("../src/logging-wrapper-entities");
const getRandomFieldValue = () => Math.random().toString(36).slice(2);
const toRedactFields = {
  input_value: {
    request: {
      "x-api-key": "non redacted because not under headers",
      headers: {
        "x-amz-security-token": getRandomFieldValue(),
        "x-api-key": getRandomFieldValue(),
        authorization: getRandomFieldValue(),
        cookie: getRandomFieldValue(),
        "set-cookie": getRandomFieldValue(),
        "proxy-authorization": getRandomFieldValue(),
        non_to_redact: "non_redacted_value",
      },
    },
    response: {
      headers: {
        "x-amz-security-token": getRandomFieldValue(),
        "x-api-key": getRandomFieldValue(),
        authorization: getRandomFieldValue(),
        cookie: getRandomFieldValue(),
        "set-cookie": getRandomFieldValue(),
        "proxy-authorization": getRandomFieldValue(),
        non_to_redact: "non_redacted_value",
      },
    },
  },
  expected_output: {
    request: {
      "x-api-key": "non redacted because not under headers",
      headers: {
        "x-amz-security-token": logging_wrapper_entities_1.REDACTED_VALUE,
        "x-api-key": logging_wrapper_entities_1.REDACTED_VALUE,
        authorization: logging_wrapper_entities_1.REDACTED_VALUE,
        cookie: logging_wrapper_entities_1.REDACTED_VALUE,
        "set-cookie": logging_wrapper_entities_1.REDACTED_VALUE,
        "proxy-authorization": logging_wrapper_entities_1.REDACTED_VALUE,
        non_to_redact: "non_redacted_value",
      },
    },
    response: {
      headers: {
        "x-amz-security-token": logging_wrapper_entities_1.REDACTED_VALUE,
        "x-api-key": logging_wrapper_entities_1.REDACTED_VALUE,
        authorization: logging_wrapper_entities_1.REDACTED_VALUE,
        cookie: logging_wrapper_entities_1.REDACTED_VALUE,
        "set-cookie": logging_wrapper_entities_1.REDACTED_VALUE,
        "proxy-authorization": logging_wrapper_entities_1.REDACTED_VALUE,
        non_to_redact: "non_redacted_value",
      },
    },
  },
};
const methodsDataProvider = [
  {
    method: "trace",
    expected: {
      level: 10,
      level_name: "TRACE",
    },
  },
  {
    method: "debug",
    expected: {
      level: 20,
      level_name: "DEBUG",
    },
  },
  {
    method: "info",
    expected: {
      level: 30,
      level_name: "INFO",
    },
  },
  {
    method: "warn",
    expected: {
      level: 40,
      level_name: "WARN",
    },
  },
  {
    method: "error",
    expected: {
      level: 50,
      level_name: "ERROR",
    },
  },
  {
    method: "fatal",
    expected: {
      level: 60,
      level_name: "FATAL",
    },
  },
];
tap_1.default.test("Basic format is the expected one", (t) => {
  const { logger, loggedRecordsMethod } = (0, build_logger_1.buildLogger)({
    ...(0, logging_wrapper_1.getLoggerConfiguration)("debug"),
  });
  logger.debug("test message");
  logger.info("another message");
  const loggedRecords = loggedRecordsMethod();
  t.equal(loggedRecords.length, 2);
  const parsed = JSON.parse(loggedRecords[0]);
  t.type(parsed.timestamp, "number");
  t.ok(
    parsed.timestamp > Date.now() - 2000,
    "the timestamp must be newer than 2 seconds ago",
  );
  delete parsed.timestamp;
  t.match(parsed, {
    level: 20,
    level_name: "DEBUG",
    hostname: (0, os_1.hostname)(),
    message: "test message",
  });
  t.end();
});
tap_1.default.test("Fields are redacted as expected", (t) => {
  const { logger, loggedRecordsMethod } = (0, build_logger_1.buildLogger)({
    ...(0, logging_wrapper_1.getLoggerConfiguration)(),
  });
  logger.warn(toRedactFields.input_value);
  const loggedRecords = loggedRecordsMethod();
  const parsed = JSON.parse(loggedRecords[0]);
  delete parsed.hostname;
  delete parsed.level;
  delete parsed.level_name;
  delete parsed.timestamp;
  t.match(parsed, toRedactFields.expected_output);
  t.end();
});
methodsDataProvider.forEach((methodDataProvider) =>
  tap_1.default.test(
    `Methods are writing correct levels - ${methodDataProvider.method}`,
    (t) => {
      const { logger, loggedRecordsMethod } = (0, build_logger_1.buildLogger)({
        ...(0, logging_wrapper_1.getLoggerConfiguration)("trace"),
      });
      logger[methodDataProvider.method]("test");
      const loggedRecords = loggedRecordsMethod();
      t.equal(loggedRecords.length, 1);
      const parsed = JSON.parse(loggedRecords[0]);
      t.equal(parsed.level, methodDataProvider.expected.level);
      t.equal(parsed.level_name, methodDataProvider.expected.level_name);
      t.end();
    },
  ),
);
