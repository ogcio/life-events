import { FastifyInstance } from "fastify";
import { buildFastify } from "./build-fastify";
import {
  TestingLoggerDestination,
  getTestingDestinationLogger,
} from "./build-logger";
import {
  LogErrorClasses,
  LogMessages,
} from "../../src/logging-wrapper-entities";
import { t } from "tap";

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
export const DEFAULT_PATH = "/ping";

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

export const checkGenericEntryFields = (params: {
  parsedEntry: { [x: string]: unknown };
  expectedLevelName: string;
  expectedMessage: string;
}): void => {
  const { parsedEntry, expectedLevelName, expectedMessage } = params;

  t.equal(parsedEntry.level_name, expectedLevelName);
  t.ok(typeof parsedEntry.level !== "undefined");
  t.type(parsedEntry.level, "number");
  t.equal(parsedEntry.message, expectedMessage);
  t.ok(typeof parsedEntry.request_id !== "undefined");
  t.type(parsedEntry.request_id, "string");
  t.ok(typeof parsedEntry.timestamp !== "undefined");
  t.type(parsedEntry.timestamp, "number");
};

export const checkExpectedRequestEntry = (params: {
  requestLogEntry: string;
  inputScheme?: string;
  inputQueryParams?: { [x: string]: unknown };
  inputMethod?: string;
  inputPath?: string;
  inputHeaders?: { [x: string]: unknown };
}): void => {
  const parsed = parseLogEntry(params.requestLogEntry);
  params.inputMethod = params.inputMethod ?? DEFAULT_METHOD;
  params.inputScheme = params.inputScheme ?? DEFAULT_SCHEME;
  params.inputPath = params.inputPath ?? DEFAULT_PATH;
  checkGenericEntryFields({
    parsedEntry: parsed,
    expectedLevelName: "INFO",
    expectedMessage: LogMessages.NewRequest,
  });
  t.ok(typeof parsed.request !== "undefined");
  t.equal(parsed.request?.scheme, params.inputScheme);
  t.equal(parsed.request?.method, params.inputMethod);
  t.equal(parsed.request?.path, params.inputPath);
  t.equal(parsed.request?.hostname, DEFAULT_HOSTNAME);
  t.same(parsed.request?.query_params, params.inputQueryParams ?? {});
  t.same(parsed.request?.headers, {
    ...DEFAULT_REQUEST_HEADERS,
    ...(params.inputHeaders ?? {}),
  });
  t.equal(parsed.request?.client_ip, DEFAULT_CLIENT_IP);
  t.equal(parsed.request?.user_agent, DEFAULT_USER_AGENT);
};

export const checkExpectedResponseEntry = (params: {
  responseLogEntry: string;
  inputScheme?: string;
  inputQueryParams?: { [x: string]: unknown };
  inputMethod?: string;
  inputPath?: string;
  responseStatusCode: number;
  expectedMessage?: string;
}): void => {
  const parsed = parseLogEntry(params.responseLogEntry);
  params.inputMethod = params.inputMethod ?? DEFAULT_METHOD;
  params.inputScheme = params.inputScheme ?? DEFAULT_SCHEME;
  params.inputPath = params.inputPath ?? DEFAULT_PATH;

  checkGenericEntryFields({
    parsedEntry: parsed,
    expectedLevelName: "INFO",
    expectedMessage: params.expectedMessage ?? LogMessages.Response,
  });
  t.ok(typeof parsed.request !== "undefined");
  t.equal(parsed.request.scheme, params.inputScheme);
  t.equal(parsed.request.method, params.inputMethod);
  t.equal(parsed.request.path, params.inputPath);
  t.equal(parsed.request.hostname, DEFAULT_HOSTNAME);
  t.same(parsed.request.query_params, params.inputQueryParams ?? {});
  t.ok(typeof parsed.response !== "undefined");
  t.equal(parsed.response.status_code, params.responseStatusCode);
  t.equal(parsed.response.headers["content-type"], DEFAULT_CONTENT_TYPE);
};

export const checkExpectedApiTrackEntry = (params: {
  apiTrackLogEntry: string;
  inputScheme?: string;
  inputQueryParams?: { [x: string]: unknown };
  inputMethod?: string;
  inputPath?: string;
  errorClass?: string;
  errorMessage?: string;
  errorCode?: string;
  responseStatusCode: number;
}) => {
  params.inputMethod = params.inputMethod ?? DEFAULT_METHOD;
  params.inputScheme = params.inputScheme ?? DEFAULT_SCHEME;
  params.inputPath = params.inputPath ?? DEFAULT_PATH;

  checkExpectedResponseEntry({
    ...params,
    responseLogEntry: params.apiTrackLogEntry,
    expectedMessage: LogMessages.ApiTrack,
  });

  if (!params.errorClass) {
    return;
  }

  const parsed = parseLogEntry(params.apiTrackLogEntry);

  t.ok(typeof parsed.error !== "undefined");
  t.equal(parsed.error.class, params.errorClass);
  t.equal(parsed.error.message, params.errorMessage);
  t.equal(parsed.error.code, params.errorCode);
};

export const checkExpectedErrorEntry = (params: {
  errorLogEntry: string;
  inputScheme?: string;
  inputQueryParams?: { [x: string]: unknown };
  inputMethod?: string;
  inputPath?: string;
  errorClass: string;
  errorMessage: string;
  errorCode: string;
}): void => {
  const parsed = parseLogEntry(params.errorLogEntry);
  params.inputMethod = params.inputMethod ?? DEFAULT_METHOD;
  params.inputScheme = params.inputScheme ?? DEFAULT_SCHEME;
  params.inputPath = params.inputPath ?? DEFAULT_PATH;
  checkGenericEntryFields({
    parsedEntry: parsed,
    expectedLevelName: "ERROR",
    expectedMessage: LogMessages.Error,
  });
  t.ok(typeof parsed.request !== "undefined");
  t.equal(parsed.request?.scheme, params.inputScheme);
  t.equal(parsed.request?.method, params.inputMethod);
  t.equal(parsed.request?.path, params.inputPath);
  t.equal(parsed.request?.hostname, DEFAULT_HOSTNAME);
  t.same(parsed.request?.query_params, params.inputQueryParams ?? {});
  t.ok(typeof parsed.error !== "undefined");
  t.equal(parsed.error.class, params.errorClass);
  t.equal(parsed.error.code, params.errorCode);
  t.equal(parsed.error.message, params.errorMessage);
  t.ok(typeof parsed.error.trace !== "undefined");
  t.type(typeof parsed.error.trace, "string");
};

export const runErrorTest = async (params: {
  server: FastifyInstance;
  loggingDestination: TestingLoggerDestination;
  inputStatusCode: string;
  errorMessage: string;
  expectedClass: LogErrorClasses;
  expectedStatusCode: number;
  expectedErrorMessage?: string;
  path?: string;
  expectedFastifyCode?: string;
}) => {
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
  const inputHeaders = { accept: DEFAULT_CONTENT_TYPE };
  const response = await server.inject({
    method: DEFAULT_METHOD,
    url: path,
    query: { status_code: inputStatusCode, error_message: errorMessage },
    headers: inputHeaders,
  });

  t.ok(typeof response !== "undefined");
  t.equal(response.statusCode, expectedStatusCode);
  const loggedRecords = loggingDestination.getLoggedRecords();
  t.equal(loggedRecords.length, 4);
  checkExpectedRequestEntry({
    requestLogEntry: loggedRecords[0],
    inputPath: path,
    inputQueryParams: {
      error_message: errorMessage,
      status_code: inputStatusCode,
    },
    inputHeaders,
  });
  checkExpectedErrorEntry({
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
  checkExpectedResponseEntry({
    responseLogEntry: loggedRecords[2],
    inputPath: path,
    inputQueryParams: {
      error_message: errorMessage,
      status_code: inputStatusCode,
    },
    responseStatusCode: Number(expectedStatusCode),
  });
  console.log(loggedRecords[1]);
  checkExpectedApiTrackEntry({
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
