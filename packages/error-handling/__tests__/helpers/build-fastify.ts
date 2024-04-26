import { FastifyError, createError } from "@fastify/error";
import { pino, DestinationStream } from "pino";
import fastify, { FastifyInstance } from "fastify";
import { initializeErrorHandling } from "../..";

export const buildFastify = (
  loggerDestination?: DestinationStream,
): FastifyInstance => {
  const server = fastify({ logger: pino({}, loggerDestination) });
  initializeErrorHandling(server as unknown as FastifyInstance);

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
    const requestedMessage = String(parsed["error_message"] ?? "WHOOOPS");

    const error = createError(
      "CUSTOM_CODE",
      requestedMessage as string,
      422,
    )() as FastifyError & {
      headers: { [x: string]: unknown };
      status: number | undefined;
    };

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
    error.status = 423;

    throw error;
  });

  return server as unknown as FastifyInstance;
};
