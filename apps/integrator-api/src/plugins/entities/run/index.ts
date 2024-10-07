import { HttpErrors } from "@fastify/sensible";
import {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyPluginAsync,
} from "fastify";
import fp from "fastify-plugin";
import { RunRepo } from "./repo";
import { RunDetailsDO, RunStepDO } from "./types";

export type RunPlugin = Awaited<ReturnType<typeof buildPlugin>>;

const buildGetUserRuns =
  (repo: RunRepo, log: FastifyBaseLogger) =>
  async (userId: string): Promise<RunDetailsDO[]> => {
    let result;

    try {
      result = await repo.getUserRuns(userId);
    } catch (err) {
      log.error((err as Error).message);
    }

    return result?.rows ?? [];
  };

const buildGetRunsByJourneyId =
  (repo: RunRepo, log: FastifyBaseLogger) =>
  async (journeyId: string): Promise<RunDetailsDO[]> => {
    let result;

    try {
      result = await repo.getRunsByJourney(journeyId);
    } catch (err) {
      log.error((err as Error).message);
    }

    return result?.rows ?? [];
  };

const buildGetRunById =
  (repo: RunRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (runId: string): Promise<RunDetailsDO> => {
    let result;

    try {
      result = await repo.getRunById(runId);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rowCount) {
      throw httpErrors.notFound("The requested run was not found");
    }

    return result?.rows[0];
  };

const buildGetUserRunById =
  (repo: RunRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (runId: string, userId: string): Promise<RunDetailsDO> => {
    let result;

    try {
      result = await repo.getUserRunById(runId, userId);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rowCount) {
      throw httpErrors.notFound("The requested run was not found");
    }

    return result?.rows[0];
  };

const buildGetRunStepsByRunId =
  (repo: RunRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (runId: string): Promise<RunStepDO[]> => {
    let result;

    try {
      result = await repo.getRunStepsByRunId(runId);
    } catch (err) {
      log.error((err as Error).message);
    }

    return result?.rows ?? [];
  };

const buildPlugin = (
  repo: RunRepo,
  log: FastifyBaseLogger,
  httpErrors: HttpErrors,
) => {
  return {
    getUserRuns: buildGetUserRuns(repo, log),
    getUserRunById: buildGetUserRunById(repo, log, httpErrors),
    getRunsByJourneyId: buildGetRunsByJourneyId(repo, log),
    getRunById: buildGetRunById(repo, log, httpErrors),
    getRunStepsByRunId: buildGetRunStepsByRunId(repo, log, httpErrors),
  };
};

const initPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const repo = new RunRepo(fastify.pg);
  const plugin = buildPlugin(repo, fastify.log, fastify.httpErrors);

  fastify.decorate("run", plugin);
};

export default fp(initPlugin, {
  name: "RunPlugin",
});
