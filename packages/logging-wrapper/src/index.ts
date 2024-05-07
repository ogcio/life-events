import { FastifyInstance, FastifyServerOptions } from "fastify";
import {
  getLoggingConfiguration as fastifyLoggingConfiguration,
  initializeLoggingHooks as fastifyLoggingHooks,
} from "./fastify-logging-wrapper.js";
import { DestinationStream } from "pino";

export const getLoggingConfiguration = (
  loggerDestination?: DestinationStream,
): FastifyServerOptions => fastifyLoggingConfiguration(loggerDestination);

export const initializeLoggingHooks = (server: FastifyInstance): void =>
  fastifyLoggingHooks(server);
