import { LogErrorClasses } from "../src/logging-wrapper-entities.js";
import { t } from "tap";
import {
  DEFAULT_METHOD,
  checkExpectedApiTrackEntry,
  checkExpectedErrorEntry,
  checkExpectedRequestEntry,
  checkExpectedResponseEntry,
  initializeServer,
  parseLogEntry,
  runErrorTest,
} from "./helpers/fastify-test-helpers.js";
import { LifeEventsError } from "shared-errors";

t.test("Error data are correctly set", async () => {
  const { server, loggingDestination } = initializeServer();
  t.teardown(() => server.close());
  await runErrorTest({
    server,
    loggingDestination,
    inputStatusCode: "500",
    expectedStatusCode: 500,
    errorMessage: "WHoooopS!",
    expectedClass: LogErrorClasses.ServerError,
  });

  t.end();
});

t.test("Unknown Error route logs expected values", async () => {
  const { server, loggingDestination } = initializeServer();
  t.teardown(() => server.close());
  await runErrorTest({
    server,
    loggingDestination,
    inputStatusCode: "399",
    expectedStatusCode: 500,
    errorMessage: "Unknown!",
    expectedClass: LogErrorClasses.UnknownError,
  });

  t.end();
});

t.test("400 Error route logs expected values", async () => {
  const { server, loggingDestination } = initializeServer();
  t.teardown(() => server.close());
  await runErrorTest({
    server,
    loggingDestination,
    inputStatusCode: "400",
    expectedStatusCode: 400,
    errorMessage: "Bad request!",
    expectedClass: LogErrorClasses.RequestError,
  });

  t.end();
});

t.test("422 Validation Error route logs expected values", async () => {
  const { server, loggingDestination } = initializeServer();
  t.teardown(() => server.close());
  await runErrorTest({
    server,
    loggingDestination,
    inputStatusCode: "422",
    expectedStatusCode: 422,
    errorMessage: "Bad request!",
    expectedClass: LogErrorClasses.ValidationError,
  });

  t.end();
});

t.test("Error without status code logs expected values", async () => {
  const { server, loggingDestination } = initializeServer();
  t.teardown(() => server.close());
  await runErrorTest({
    server,
    loggingDestination,
    inputStatusCode: undefined,
    expectedStatusCode: 500,
    errorMessage: "Unknown!",
    expectedClass: LogErrorClasses.UnknownError,
    expectedFastifyCode: "UNHANDLED_EXCEPTION",
  });

  t.end();
});

t.test("Life events error logs expected values", async () => {
  const { server, loggingDestination } = initializeServer();
  t.teardown(() => server.close());
  const response = await server.inject({
    method: DEFAULT_METHOD,
    url: "/life-events-error",
  });

  t.ok(typeof response !== "undefined");
  t.equal(response.statusCode, 500);
  const loggedRecords = loggingDestination.getLoggedRecords();
  t.equal(loggedRecords.length, 4);
  const mockErrorInstance = new LifeEventsError("MOCK", "mock");
  checkExpectedRequestEntry({
    requestLogEntry: loggedRecords[0],
    inputPath: "/life-events-error",
  });

  checkExpectedErrorEntry({
    errorLogEntry: loggedRecords[1],
    inputPath: "/life-events-error",
    errorClass: LogErrorClasses.ServerError,
    errorMessage: "mock",
    errorCode: mockErrorInstance.name,
    expectedLevelName: "ERROR",
  });
  const parsed = parseLogEntry(loggedRecords[1]);
  t.equal(parsed.error.process, "TESTING");
  t.equal(parsed.error.parent.message, "I am the parent");
  t.equal(parsed.error.parent.name, "Error");
  t.type(parsed.error.parent.stack, "string");

  checkExpectedResponseEntry({
    responseLogEntry: loggedRecords[2],
    inputPath: "/life-events-error",
    responseStatusCode: 500,
  });
  checkExpectedApiTrackEntry({
    apiTrackLogEntry: loggedRecords[3],
    inputPath: "/life-events-error",
    responseStatusCode: 500,
    errorClass: LogErrorClasses.ServerError,
    errorMessage: "mock",
    errorCode: mockErrorInstance.name,
  });

  t.end();
});
