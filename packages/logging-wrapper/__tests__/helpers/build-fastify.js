"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFastify = void 0;
const fastify_1 = __importDefault(require("fastify"));
const fastify_logging_wrapper_1 = require("../../src/fastify-logging-wrapper");
const error_1 = require("@fastify/error");
const buildFastify = (loggerDestination) => {
  const server = (0, fastify_1.default)({
    ...(0, fastify_logging_wrapper_1.getLoggingConfiguration)(
      loggerDestination,
    ),
  });
  (0, fastify_logging_wrapper_1.initializeLoggingHooks)(server);
  server.get("/ping", async (_request, _reply) => {
    return { data: "pong\n" };
  });
  server.get("/error", async (request, _reply) => {
    const parsed = request.query;
    const requestedStatusCode = Number(parsed["status_code"] ?? "500");
    const requestedMessage = parsed["error_message"] ?? "WHOOOPS";
    throw (0, error_1.createError)(
      "CUSTOM_CODE",
      requestedMessage,
      requestedStatusCode,
    )();
  });
  server.post("/logs", async (request, _reply) => {
    const body = request.body;
    const logMessage = body.log_entry ?? "Default additional message";
    request.log.info(logMessage);
    return { data: { message: logMessage } };
  });
  return server;
};
exports.buildFastify = buildFastify;
