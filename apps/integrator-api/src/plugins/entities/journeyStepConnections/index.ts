import { HttpErrors } from "@fastify/sensible";
import {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyPluginAsync,
} from "fastify";
import fp from "fastify-plugin";
import { JourneyStepConnectionsRepo } from "./repo";
import {
  CreateJourneyStepConnectionDO,
  JourneyStepConnectionDO,
} from "./types";

export type JourneyStepConnectionsPlugin = Awaited<
  ReturnType<typeof buildPlugin>
>;

const buildGetConnectionById =
  (
    repo: JourneyStepConnectionsRepo,
    log: FastifyBaseLogger,
    httpErrors: HttpErrors,
  ) =>
  async (connectionId: string): Promise<JourneyStepConnectionDO> => {
    let result;

    try {
      result = await repo.getConnectionById(connectionId);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rowCount) {
      throw httpErrors.notFound(
        "The requested journey step connection was not found",
      );
    }

    return result?.rows[0];
  };

const buildCreateConnection =
  (
    repo: JourneyStepConnectionsRepo,
    log: FastifyBaseLogger,
    httpErrors: HttpErrors,
  ) =>
  async (
    connection: CreateJourneyStepConnectionDO,
  ): Promise<JourneyStepConnectionDO> => {
    let result;

    try {
      result = await repo.createConnection(connection);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rows?.[0]) {
      throw httpErrors.internalServerError(
        "Something went wrong during journey step connection creation",
      );
    }

    return result?.rows[0];
  };

const buildDeleteConnection =
  (
    repo: JourneyStepConnectionsRepo,
    log: FastifyBaseLogger,
    httpErrors: HttpErrors,
  ) =>
  async (connectionId: string): Promise<boolean> => {
    let result;

    try {
      result = await repo.deleteConnection(connectionId);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rows?.[0]) {
      throw httpErrors.internalServerError(
        "Something went wrong during journey step connection deletion",
      );
    }

    return result?.rows[0] ? true : false;
  };

const buildPlugin = (
  repo: JourneyStepConnectionsRepo,
  log: FastifyBaseLogger,
  httpErrors: HttpErrors,
) => {
  return {
    getConnectionById: buildGetConnectionById(repo, log, httpErrors),
    createConnection: buildCreateConnection(repo, log, httpErrors),
    deleteConnection: buildDeleteConnection(repo, log, httpErrors),
  };
};

const initPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const repo = new JourneyStepConnectionsRepo(fastify.pg);
  const plugin = buildPlugin(repo, fastify.log, fastify.httpErrors);

  fastify.decorate("journeyStepConnections", plugin);
};

export default fp(initPlugin, {
  name: "JourneyStepConnectionsPlugin",
});
