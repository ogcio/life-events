import Fastify from "fastify";
import {
  getLoggingConfiguration,
  initializeLoggingHooks,
} from "../../src/fastify-logging-wrapper.js";
import { DestinationStream } from "pino";
import { createError } from "@fastify/error";

export const buildFastify = (loggerDestination?: DestinationStream) => {
  const server = Fastify({
    ...getLoggingConfiguration(loggerDestination),
  });

  initializeLoggingHooks(server);

  server.get("/ping", async (_request, _reply) => {
    return { data: "pong\n" };
  });

  server.get("/error", async (request, _reply) => {
    const parsed = request.query as { [x: string]: unknown };
    const requestedStatusCode = Number(parsed["status_code"] ?? "500");
    const requestedMessage = String(parsed["error_message"] ?? "WHOOOPS");

    if (!parsed["status_code"]) {
      throw new Error(requestedMessage);
    }

    throw createError(
      "CUSTOM_CODE",
      requestedMessage as string,
      requestedStatusCode as number,
    )();
  });

  server.post("/logs", async (request, _reply) => {
    const body = request.body as { [x: string]: unknown };
    const logMessage = body.log_entry ?? "Default additional message";

    request.log.info(logMessage);

    return { data: { message: logMessage } };
  });

  return server;
};
