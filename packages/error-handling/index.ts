import { FastifyInstance } from "fastify";
import { initializeErrorHandler } from "./src/initialize-error-handler";

export const initializeErrorHandling = (server: FastifyInstance): void =>
  initializeErrorHandler(server);
