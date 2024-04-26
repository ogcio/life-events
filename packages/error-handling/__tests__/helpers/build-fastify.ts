import { FastifyError, createError } from "@fastify/error";
import { pino, DestinationStream } from "pino";
import fastify, { FastifyInstance } from "fastify";
import { initializeErrorHandler } from "../../src/initialize-error-handler";

export const buildFastify = (
  loggerDestination?: DestinationStream,
): FastifyInstance => {
  const server = fastify({ logger: pino({}, loggerDestination) });
  initializeErrorHandler(server as unknown as FastifyInstance);

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

  server.get("/validation", async (request, _reply) => {
    const parsed = request.query as { [x: string]: unknown };
    const requestedStatusCode = Number(parsed["status_code"] ?? "500");
    const requestedMessage = String(parsed["error_message"] ?? "WHOOOPS");

    const error = createError(
      "CUSTOM_CODE",
      requestedMessage as string,
      requestedStatusCode as number,
    )() as FastifyError & { headers: { [x: string]: unknown } };

    error.validation = [
      {
        keyword: "field",
        instancePath: "the.instance.path",
        schemaPath: "the.schema.path",
        params: { field: "one", property: "two" },
        message: requestedMessage,
      },
    ];

    error.validationContext = "body";

    error.headers = { error_header: "value" };

    throw error;
  });

  return server as unknown as FastifyInstance;
};
