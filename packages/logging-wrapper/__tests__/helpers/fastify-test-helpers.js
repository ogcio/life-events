"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runErrorTest =
  exports.checkExpectedErrorEntry =
  exports.checkExpectedApiTrackEntry =
  exports.checkExpectedResponseEntry =
  exports.checkExpectedRequestEntry =
  exports.checkGenericEntryFields =
  exports.parseLogEntry =
  exports.initializeServer =
  exports.DEFAULT_PATH =
  exports.DEFAULT_SCHEME =
  exports.DEFAULT_METHOD =
  exports.DEFAULT_CONTENT_TYPE =
  exports.DEFAULT_CLIENT_IP =
  exports.DEFAULT_REQUEST_HEADERS =
  exports.DEFAULT_USER_AGENT =
  exports.DEFAULT_HOSTNAME =
    void 0;
const build_fastify_1 = require("./build-fastify");
const build_logger_1 = require("./build-logger");
const logging_wrapper_entities_1 = require("../../src/logging-wrapper-entities");
const tap_1 = require("tap");
exports.DEFAULT_HOSTNAME = "localhost:80";
exports.DEFAULT_USER_AGENT = "lightMyRequest";
exports.DEFAULT_REQUEST_HEADERS = {
  "user-agent": "lightMyRequest",
  host: "localhost:80",
};
exports.DEFAULT_CLIENT_IP = "127.0.0.1";
exports.DEFAULT_CONTENT_TYPE = "application/json; charset=utf-8";
exports.DEFAULT_METHOD = "GET";
exports.DEFAULT_SCHEME = "http";
exports.DEFAULT_PATH = "/ping";
const initializeServer = () => {
  const loggingDestination = (0, build_logger_1.getTestingDestinationLogger)();
  const server = (0, build_fastify_1.buildFastify)(
    loggingDestination.loggerDestination,
  );
  return { server, loggingDestination };
};
exports.initializeServer = initializeServer;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseLogEntry = (logEntry) => JSON.parse(logEntry);
exports.parseLogEntry = parseLogEntry;
const checkGenericEntryFields = (params) => {
  const { parsedEntry, expectedLevelName, expectedMessage } = params;
  tap_1.t.equal(parsedEntry.level_name, expectedLevelName);
  tap_1.t.ok(typeof parsedEntry.level !== "undefined");
  tap_1.t.type(parsedEntry.level, "number");
  tap_1.t.equal(parsedEntry.message, expectedMessage);
  tap_1.t.ok(typeof parsedEntry.request_id !== "undefined");
  tap_1.t.type(parsedEntry.request_id, "string");
  tap_1.t.ok(typeof parsedEntry.timestamp !== "undefined");
  tap_1.t.type(parsedEntry.timestamp, "number");
};
exports.checkGenericEntryFields = checkGenericEntryFields;
const checkExpectedRequestEntry = (params) => {
  const parsed = (0, exports.parseLogEntry)(params.requestLogEntry);
  params.inputMethod = params.inputMethod ?? exports.DEFAULT_METHOD;
  params.inputScheme = params.inputScheme ?? exports.DEFAULT_SCHEME;
  params.inputPath = params.inputPath ?? exports.DEFAULT_PATH;
  (0, exports.checkGenericEntryFields)({
    parsedEntry: parsed,
    expectedLevelName: "INFO",
    expectedMessage: logging_wrapper_entities_1.LogMessages.NewRequest,
  });
  tap_1.t.ok(typeof parsed.request !== "undefined");
  tap_1.t.equal(parsed.request?.scheme, params.inputScheme);
  tap_1.t.equal(parsed.request?.method, params.inputMethod);
  tap_1.t.equal(parsed.request?.path, params.inputPath);
  tap_1.t.equal(parsed.request?.hostname, exports.DEFAULT_HOSTNAME);
  tap_1.t.same(parsed.request?.query_params, params.inputQueryParams ?? {});
  tap_1.t.same(parsed.request?.headers, {
    ...exports.DEFAULT_REQUEST_HEADERS,
    ...(params.inputHeaders ?? {}),
  });
  tap_1.t.equal(parsed.request?.client_ip, exports.DEFAULT_CLIENT_IP);
  tap_1.t.equal(parsed.request?.user_agent, exports.DEFAULT_USER_AGENT);
};
exports.checkExpectedRequestEntry = checkExpectedRequestEntry;
const checkExpectedResponseEntry = (params) => {
  const parsed = (0, exports.parseLogEntry)(params.responseLogEntry);
  params.inputMethod = params.inputMethod ?? exports.DEFAULT_METHOD;
  params.inputScheme = params.inputScheme ?? exports.DEFAULT_SCHEME;
  params.inputPath = params.inputPath ?? exports.DEFAULT_PATH;
  (0, exports.checkGenericEntryFields)({
    parsedEntry: parsed,
    expectedLevelName: "INFO",
    expectedMessage:
      params.expectedMessage ?? logging_wrapper_entities_1.LogMessages.Response,
  });
  tap_1.t.ok(typeof parsed.request !== "undefined");
  tap_1.t.equal(parsed.request.scheme, params.inputScheme);
  tap_1.t.equal(parsed.request.method, params.inputMethod);
  tap_1.t.equal(parsed.request.path, params.inputPath);
  tap_1.t.equal(parsed.request.hostname, exports.DEFAULT_HOSTNAME);
  tap_1.t.same(parsed.request.query_params, params.inputQueryParams ?? {});
  tap_1.t.ok(typeof parsed.response !== "undefined");
  tap_1.t.equal(parsed.response.status_code, params.responseStatusCode);
  tap_1.t.equal(
    parsed.response.headers["content-type"],
    exports.DEFAULT_CONTENT_TYPE,
  );
};
exports.checkExpectedResponseEntry = checkExpectedResponseEntry;
const checkExpectedApiTrackEntry = (params) => {
  params.inputMethod = params.inputMethod ?? exports.DEFAULT_METHOD;
  params.inputScheme = params.inputScheme ?? exports.DEFAULT_SCHEME;
  params.inputPath = params.inputPath ?? exports.DEFAULT_PATH;
  (0, exports.checkExpectedResponseEntry)({
    ...params,
    responseLogEntry: params.apiTrackLogEntry,
    expectedMessage: logging_wrapper_entities_1.LogMessages.ApiTrack,
  });
  if (!params.errorClass) {
    return;
  }
  const parsed = (0, exports.parseLogEntry)(params.apiTrackLogEntry);
  tap_1.t.ok(typeof parsed.error !== "undefined");
  tap_1.t.equal(parsed.error.class, params.errorClass);
  tap_1.t.equal(parsed.error.message, params.errorMessage);
  tap_1.t.equal(parsed.error.code, params.errorCode);
};
exports.checkExpectedApiTrackEntry = checkExpectedApiTrackEntry;
const checkExpectedErrorEntry = (params) => {
  const parsed = (0, exports.parseLogEntry)(params.errorLogEntry);
  params.inputMethod = params.inputMethod ?? exports.DEFAULT_METHOD;
  params.inputScheme = params.inputScheme ?? exports.DEFAULT_SCHEME;
  params.inputPath = params.inputPath ?? exports.DEFAULT_PATH;
  (0, exports.checkGenericEntryFields)({
    parsedEntry: parsed,
    expectedLevelName: "ERROR",
    expectedMessage: logging_wrapper_entities_1.LogMessages.Error,
  });
  tap_1.t.ok(typeof parsed.request !== "undefined");
  tap_1.t.equal(parsed.request?.scheme, params.inputScheme);
  tap_1.t.equal(parsed.request?.method, params.inputMethod);
  tap_1.t.equal(parsed.request?.path, params.inputPath);
  tap_1.t.equal(parsed.request?.hostname, exports.DEFAULT_HOSTNAME);
  tap_1.t.same(parsed.request?.query_params, params.inputQueryParams ?? {});
  tap_1.t.ok(typeof parsed.error !== "undefined");
  tap_1.t.equal(parsed.error.class, params.errorClass);
  tap_1.t.equal(parsed.error.code, params.errorCode);
  tap_1.t.equal(parsed.error.message, params.errorMessage);
  tap_1.t.ok(typeof parsed.error.trace !== "undefined");
  tap_1.t.type(typeof parsed.error.trace, "string");
};
exports.checkExpectedErrorEntry = checkExpectedErrorEntry;
const runErrorTest = async (params) => {
  const {
    server,
    loggingDestination,
    inputStatusCode,
    errorMessage,
    expectedClass,
    expectedStatusCode,
  } = params;
  const path = params.path ?? "/error";
  const expectedFastifyCode = params.expectedFastifyCode ?? "CUSTOM_CODE";
  const inputHeaders = { accept: exports.DEFAULT_CONTENT_TYPE };
  const response = await server.inject({
    method: exports.DEFAULT_METHOD,
    url: path,
    query: { status_code: inputStatusCode, error_message: errorMessage },
    headers: inputHeaders,
  });
  tap_1.t.ok(typeof response !== "undefined");
  tap_1.t.equal(response.statusCode, expectedStatusCode);
  const loggedRecords = loggingDestination.getLoggedRecords();
  tap_1.t.equal(loggedRecords.length, 4);
  (0, exports.checkExpectedRequestEntry)({
    requestLogEntry: loggedRecords[0],
    inputPath: path,
    inputQueryParams: {
      error_message: errorMessage,
      status_code: inputStatusCode,
    },
    inputHeaders,
  });
  (0, exports.checkExpectedErrorEntry)({
    errorLogEntry: loggedRecords[1],
    inputPath: path,
    errorClass: expectedClass,
    errorMessage,
    errorCode: expectedFastifyCode,
    inputQueryParams: {
      error_message: errorMessage,
      status_code: inputStatusCode,
    },
  });
  (0, exports.checkExpectedResponseEntry)({
    responseLogEntry: loggedRecords[2],
    inputPath: path,
    inputQueryParams: {
      error_message: errorMessage,
      status_code: inputStatusCode,
    },
    responseStatusCode: Number(expectedStatusCode),
  });
  console.log(loggedRecords[1]);
  (0, exports.checkExpectedApiTrackEntry)({
    apiTrackLogEntry: loggedRecords[3],
    inputPath: path,
    inputQueryParams: {
      error_message: errorMessage,
      status_code: inputStatusCode,
    },
    responseStatusCode: Number(expectedStatusCode),
    errorClass: expectedClass,
    errorMessage,
    errorCode: expectedFastifyCode,
  });
};
exports.runErrorTest = runErrorTest;
