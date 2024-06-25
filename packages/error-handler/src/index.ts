import { FastifyInstance } from "fastify";
import {
  initializeNotFoundHandler,
  setupErrorHandler,
  HttpError as BaseHttpError,
} from "./initialize-error-handler.js";

export const initializeErrorHandler = (server: FastifyInstance): void => {
  setupErrorHandler(server);
  initializeNotFoundHandler(server);
};

export type HttpError = BaseHttpError;
