import { FastifyInstance } from "fastify";
import { initializeErrorHandler } from "./src/initialize-error-handler";
import { initializeLoggingHooks } from "logging-wrapper";

export const initializeErrorHandling = (server: FastifyInstance): void => {
  initializeErrorHandler(server);
  initializeLoggingHooks(server);
};
