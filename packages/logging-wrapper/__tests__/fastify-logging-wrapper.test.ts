import { LogMessages } from "../src/logging-wrapper-entities.js";
import { t } from "tap";
import {
  initializeServer,
  DEFAULT_METHOD,
  DEFAULT_PATH,
  checkExpectedRequestEntry,
  checkExpectedResponseEntry,
  parseLogEntry,
  checkGenericEntryFields,
} from "./helpers/fastify-test-helpers.js";

t.test(
  "Logging entries when all works fine are the expected ones",
  async () => {
    const { server, loggingDestination } = initializeServer();
    t.teardown(() => server.close());

    const response = await server.inject({
      method: DEFAULT_METHOD,
      url: DEFAULT_PATH,
    });
    t.ok(typeof response !== "undefined");
    t.equal(response?.statusCode, 200);
    const loggedRecords = loggingDestination.getLoggedRecords();
    t.equal(loggedRecords.length, 3);
    checkExpectedRequestEntry({
      requestLogEntry: loggedRecords[0],
    });
    checkExpectedResponseEntry({
      responseLogEntry: loggedRecords[1],
      responseStatusCode: 200,
    });
    checkExpectedResponseEntry({
      responseLogEntry: loggedRecords[2],
      responseStatusCode: 200,
      expectedMessage: LogMessages.ApiTrack,
    });

    t.end();
  },
);

t.test("Request id is not overriden by header", async () => {
  const { server, loggingDestination } = initializeServer();
  t.teardown(() => server.close());
  const customRequestId = "Another request id";
  const response = await server.inject({
    method: DEFAULT_METHOD,
    url: DEFAULT_PATH,
    headers: { "request-id": customRequestId },
  });
  t.ok(typeof response !== "undefined");
  t.equal(response?.statusCode, 200);
  const logged = loggingDestination.getLoggedRecords();
  checkExpectedRequestEntry({
    requestLogEntry: logged[0],
    inputHeaders: { "request-id": customRequestId },
  });
  const parsedEntry = parseLogEntry(logged[0]);
  t.notSame(parsedEntry.request_id, customRequestId);

  t.end();
});

t.test("Logging context is reset between requests", async () => {
  const { server, loggingDestination } = initializeServer();
  t.teardown(() => server.close());

  let response = await server.inject({
    method: DEFAULT_METHOD,
    url: DEFAULT_PATH,
  });

  t.ok(typeof response !== "undefined");
  t.equal(response?.statusCode, 200);
  let loggedRecords = loggingDestination.getLoggedRecords();
  t.equal(loggedRecords.length, 3);
  let parsedResponse = parseLogEntry(loggedRecords[1]);
  t.ok(typeof parsedResponse.response !== "undefined");

  response = await server.inject({
    method: DEFAULT_METHOD,
    url: DEFAULT_PATH,
  });
  t.ok(typeof response !== "undefined");
  t.equal(response?.statusCode, 200);
  loggedRecords = loggingDestination.getLoggedRecords();
  t.equal(loggedRecords.length, 6);
  // 3 is the New Request for 2nd call
  parsedResponse = parseLogEntry(loggedRecords[3]);
  // if undefined it means that the logging context
  // has been reset between requests
  t.ok(typeof parsedResponse.response === "undefined");

  t.end();
});

t.test("Additional logs are correctly written", async () => {
  const { server, loggingDestination } = initializeServer();
  t.teardown(() => server.close());
  const logMessage = "Testing additional logs";

  const response = await server.inject({
    method: "POST",
    url: "/logs",
    body: { log_entry: logMessage },
  });

  t.ok(typeof response !== "undefined");
  t.equal(response?.statusCode, 200);
  const loggedRecords = loggingDestination.getLoggedRecords();
  t.equal(loggedRecords.length, 4);
  const parsedAdditional = parseLogEntry(loggedRecords[1]);
  checkGenericEntryFields({
    parsedEntry: parsedAdditional,
    expectedLevelName: "INFO",
    expectedMessage: logMessage,
  });
  t.ok(typeof parsedAdditional.request !== "undefined");

  t.end();
});
