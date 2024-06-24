import { FastifyInstance, FastifyServerOptions } from "fastify";
import {
  getLoggingConfiguration as fastifyLoggingConfiguration,
  initializeLoggingHooks as fastifyLoggingHooks,
} from "./fastify-logging-wrapper.js";
import { DestinationStream } from "pino";
import {
  toLoggingError as baseToLoggingError,
  LoggingError as baseLoggingError,
} from "./logging-wrapper-entities.js";

export const getLoggingConfiguration = (
  loggerDestination?: DestinationStream,
): FastifyServerOptions => fastifyLoggingConfiguration(loggerDestination);

export const initializeLoggingHooks = (server: FastifyInstance): void =>
  fastifyLoggingHooks(server);

export const toLoggingError = baseToLoggingError;
export type LoggingError = baseLoggingError;
