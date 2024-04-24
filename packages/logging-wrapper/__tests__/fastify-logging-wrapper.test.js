"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logging_wrapper_entities_1 = require("../src/logging-wrapper-entities");
const tap_1 = require("tap");
const fastify_test_helpers_1 = require("./helpers/fastify-test-helpers");
tap_1.t.test(
  "Logging entries when all works fine are the expected ones",
  async () => {
    const { server, loggingDestination } = (0,
    fastify_test_helpers_1.initializeServer)();
    tap_1.t.teardown(() => server.close());
    const response = await server.inject({
      method: fastify_test_helpers_1.DEFAULT_METHOD,
      url: fastify_test_helpers_1.DEFAULT_PATH,
    });
    tap_1.t.ok(typeof response !== "undefined");
    tap_1.t.equal(response?.statusCode, 200);
    const loggedRecords = loggingDestination.getLoggedRecords();
    tap_1.t.equal(loggedRecords.length, 3);
    (0, fastify_test_helpers_1.checkExpectedRequestEntry)({
      requestLogEntry: loggedRecords[0],
    });
    (0, fastify_test_helpers_1.checkExpectedResponseEntry)({
      responseLogEntry: loggedRecords[1],
      responseStatusCode: 200,
    });
    (0, fastify_test_helpers_1.checkExpectedResponseEntry)({
      responseLogEntry: loggedRecords[2],
      responseStatusCode: 200,
      expectedMessage: logging_wrapper_entities_1.LogMessages.ApiTrack,
    });
    tap_1.t.end();
  },
);
tap_1.t.test("Request id is not overriden by header", async () => {
  const { server, loggingDestination } = (0,
  fastify_test_helpers_1.initializeServer)();
  tap_1.t.teardown(() => server.close());
  const customRequestId = "Another request id";
  const response = await server.inject({
    method: fastify_test_helpers_1.DEFAULT_METHOD,
    url: fastify_test_helpers_1.DEFAULT_PATH,
    headers: { "request-id": customRequestId },
  });
  tap_1.t.ok(typeof response !== "undefined");
  tap_1.t.equal(response?.statusCode, 200);
  const logged = loggingDestination.getLoggedRecords();
  (0, fastify_test_helpers_1.checkExpectedRequestEntry)({
    requestLogEntry: logged[0],
    inputHeaders: { "request-id": customRequestId },
  });
  const parsedEntry = (0, fastify_test_helpers_1.parseLogEntry)(logged[0]);
  tap_1.t.notSame(parsedEntry.request_id, customRequestId);
  tap_1.t.end();
});
tap_1.t.test("Logging context is reset between requests", async () => {
  const { server, loggingDestination } = (0,
  fastify_test_helpers_1.initializeServer)();
  tap_1.t.teardown(() => server.close());
  let response = await server.inject({
    method: fastify_test_helpers_1.DEFAULT_METHOD,
    url: fastify_test_helpers_1.DEFAULT_PATH,
  });
  tap_1.t.ok(typeof response !== "undefined");
  tap_1.t.equal(response?.statusCode, 200);
  let loggedRecords = loggingDestination.getLoggedRecords();
  tap_1.t.equal(loggedRecords.length, 3);
  let parsedResponse = (0, fastify_test_helpers_1.parseLogEntry)(
    loggedRecords[1],
  );
  tap_1.t.ok(typeof parsedResponse.response !== "undefined");
  response = await server.inject({
    method: fastify_test_helpers_1.DEFAULT_METHOD,
    url: fastify_test_helpers_1.DEFAULT_PATH,
  });
  tap_1.t.ok(typeof response !== "undefined");
  tap_1.t.equal(response?.statusCode, 200);
  loggedRecords = loggingDestination.getLoggedRecords();
  tap_1.t.equal(loggedRecords.length, 6);
  // 3 is the New Request for 2nd call
  parsedResponse = (0, fastify_test_helpers_1.parseLogEntry)(loggedRecords[3]);
  // if undefined it means that the logging context
  // has been reset between requests
  tap_1.t.ok(typeof parsedResponse.response === "undefined");
  tap_1.t.end();
});
tap_1.t.test("Additional logs are correctly written", async () => {
  const { server, loggingDestination } = (0,
  fastify_test_helpers_1.initializeServer)();
  tap_1.t.teardown(() => server.close());
  const logMessage = "Testing additional logs";
  const response = await server.inject({
    method: "POST",
    url: "/logs",
    body: { log_entry: logMessage },
  });
  tap_1.t.ok(typeof response !== "undefined");
  tap_1.t.equal(response?.statusCode, 200);
  const loggedRecords = loggingDestination.getLoggedRecords();
  tap_1.t.equal(loggedRecords.length, 4);
  const parsedAdditional = (0, fastify_test_helpers_1.parseLogEntry)(
    loggedRecords[1],
  );
  (0, fastify_test_helpers_1.checkGenericEntryFields)({
    parsedEntry: parsedAdditional,
    expectedLevelName: "INFO",
    expectedMessage: logMessage,
  });
  tap_1.t.ok(typeof parsedAdditional.request !== "undefined");
  tap_1.t.end();
});
