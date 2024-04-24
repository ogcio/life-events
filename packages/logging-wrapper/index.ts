import { FastifyInstance, FastifyServerOptions } from "fastify";
import {
  getLoggingConfiguration as fastifyLoggingConfiguration,
  initializeLoggingHooks as fastifyLoggingHooks,
} from "./src/fastify-logging-wrapper";
import { DestinationStream } from "pino";

export const getLoggingConfiguration = (
  loggerDestination?: DestinationStream,
): FastifyServerOptions => fastifyLoggingConfiguration(loggerDestination);

export const initializeLoggingHooks = (
  server: FastifyInstance,
  overrideErrorHandler: boolean = true,
): void => fastifyLoggingHooks(server, overrideErrorHandler);
