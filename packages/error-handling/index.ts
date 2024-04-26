import { FastifyInstance } from "fastify";
import {
  initializeErrorHandler,
  initializeNotFoundHandler,
} from "./src/initialize-error-handler";

export const initializeErrorHandling = (server: FastifyInstance): void => {
  initializeErrorHandler(server);
  initializeNotFoundHandler(server);
};
