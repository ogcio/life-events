import { LogErrorClasses } from "../src/logging-wrapper-entities";
import { t } from "tap";
import {
  DEFAULT_CONTENT_TYPE,
  DEFAULT_METHOD,
  initializeServer,
  runErrorTest,
} from "./helpers/fastify-test-helpers";

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

t.test("Not found route logs expected values", async () => {
  const { server, loggingDestination } = initializeServer();
  t.teardown(() => server.close());
  await runErrorTest({
    server,
    loggingDestination,
    inputStatusCode: "404",
    expectedStatusCode: 404,
    errorMessage: "Not Found",
    expectedClass: LogErrorClasses.RequestError,
    path: "/this-path-must-not-exist",
    expectedFastifyCode: "FST_ERR_NOT_FOUND",
  });

  t.end();
});

t.test("Response has the expected format", async () => {
  const { server } = initializeServer();
  t.teardown(() => server.close());
  const path = "/error";
  const inputHeaders = { accept: DEFAULT_CONTENT_TYPE };
  const response = await server.inject({
    method: DEFAULT_METHOD,
    url: path,
    query: { status_code: "422", error_message: "A validation error" },
    headers: inputHeaders,
  });

  t.ok(typeof response !== "undefined");
  t.equal(response.statusCode, 422);
  const jsonBody = response.json();
  t.type(jsonBody.request_id, "string");
  delete jsonBody.request_id;
  t.same(jsonBody, {
    code: "VALIDATION_ERROR",
    detail: "A validation error",
    name: "FastifyError",
  });
  t.end();
});
