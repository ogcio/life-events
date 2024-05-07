import { FastifyInstance } from "fastify";
import {
  initializeNotFoundHandler,
  setupErrorHandler,
} from "./initialize-error-handler.js";

export const initializeErrorHandler = (server: FastifyInstance): void => {
  setupErrorHandler(server);
  initializeNotFoundHandler(server);
};
