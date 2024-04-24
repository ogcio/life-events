"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logging_wrapper_entities_1 = require("../src/logging-wrapper-entities");
const tap_1 = require("tap");
const fastify_test_helpers_1 = require("./helpers/fastify-test-helpers");
tap_1.t.test("Error data are correctly set", async () => {
  const { server, loggingDestination } = (0,
  fastify_test_helpers_1.initializeServer)();
  tap_1.t.teardown(() => server.close());
  await (0, fastify_test_helpers_1.runErrorTest)({
    server,
    loggingDestination,
    inputStatusCode: "500",
    expectedStatusCode: 500,
    errorMessage: "WHoooopS!",
    expectedClass: logging_wrapper_entities_1.LogErrorClasses.ServerError,
  });
  tap_1.t.end();
});
tap_1.t.test("Unknown Error route logs expected values", async () => {
  const { server, loggingDestination } = (0,
  fastify_test_helpers_1.initializeServer)();
  tap_1.t.teardown(() => server.close());
  await (0, fastify_test_helpers_1.runErrorTest)({
    server,
    loggingDestination,
    inputStatusCode: "399",
    expectedStatusCode: 500,
    errorMessage: "Unknown!",
    expectedClass: logging_wrapper_entities_1.LogErrorClasses.UnknownError,
  });
  tap_1.t.end();
});
tap_1.t.test("400 Error route logs expected values", async () => {
  const { server, loggingDestination } = (0,
  fastify_test_helpers_1.initializeServer)();
  tap_1.t.teardown(() => server.close());
  await (0, fastify_test_helpers_1.runErrorTest)({
    server,
    loggingDestination,
    inputStatusCode: "400",
    expectedStatusCode: 400,
    errorMessage: "Bad request!",
    expectedClass: logging_wrapper_entities_1.LogErrorClasses.RequestError,
  });
  tap_1.t.end();
});
tap_1.t.test("422 Validation Error route logs expected values", async () => {
  const { server, loggingDestination } = (0,
  fastify_test_helpers_1.initializeServer)();
  tap_1.t.teardown(() => server.close());
  await (0, fastify_test_helpers_1.runErrorTest)({
    server,
    loggingDestination,
    inputStatusCode: "422",
    expectedStatusCode: 422,
    errorMessage: "Bad request!",
    expectedClass: logging_wrapper_entities_1.LogErrorClasses.ValidationError,
  });
  tap_1.t.end();
});
tap_1.t.test("Not found route logs expected values", async () => {
  const { server, loggingDestination } = (0,
  fastify_test_helpers_1.initializeServer)();
  tap_1.t.teardown(() => server.close());
  await (0, fastify_test_helpers_1.runErrorTest)({
    server,
    loggingDestination,
    inputStatusCode: "404",
    expectedStatusCode: 404,
    errorMessage: "Not Found",
    expectedClass: logging_wrapper_entities_1.LogErrorClasses.RequestError,
    path: "/this-path-must-not-exist",
    expectedFastifyCode: "FST_ERR_NOT_FOUND",
  });
  tap_1.t.end();
});
