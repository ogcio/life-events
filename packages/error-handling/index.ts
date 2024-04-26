import { FastifyInstance } from "fastify";
import { initializeErrorHandler } from "./src/initialize-error-handler";
import { initializeLoggingHooks } from "logging-wrapper";

export const initializeErrorHandling = (
  server: FastifyInstance,
  initializeLoggingHooksToo: boolean,
): void => {
  initializeErrorHandler(server);
  if (initializeLoggingHooksToo) {
    initializeLoggingHooks(server);
  }
};
