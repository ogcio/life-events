import { FastifyInstance } from "fastify";
import {
  initializeNotFoundHandler,
  setupErrorHandler,
} from "./src/initialize-error-handler";

export const initializeErrorHandler = (server: FastifyInstance): void => {
  setupErrorHandler(server);
  initializeNotFoundHandler(server);
};
