import { HttpErrors } from "@fastify/sensible";
import {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyPluginAsync,
} from "fastify";
import fp from "fastify-plugin";
import { RunRepo } from "./repo";
import {
  UserRunDetailsDO,
  RunStepDO,
  PSRunDetailsDO,
  UpdateRunStepDO,
  RunStatusEnum,
} from "./types";
import { Id } from "../../../routes/schemas";

export type RunPlugin = Awaited<ReturnType<typeof buildPlugin>>;

const buildGetUserRuns =
  (repo: RunRepo, log: FastifyBaseLogger) =>
  async (userId: string): Promise<UserRunDetailsDO[]> => {
    let result;

    try {
      result = await repo.getUserRuns(userId);
    } catch (err) {
      log.error((err as Error).message);
    }

    return result?.rows ?? [];
  };

const buildGetRunsByJourneyId =
  (repo: RunRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (
    journeyId: string,
    organizationId: string,
  ): Promise<PSRunDetailsDO[]> => {
    let result;

    try {
      result = await repo.getRunsByJourney(journeyId);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rows) return [];

    if (result.rows[0].organizationId !== organizationId) {
      throw httpErrors.unauthorized("Unauthorized!");
    }

    return result?.rows;
  };

const buildGetRunById =
  (repo: RunRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (runId: string, organizationId: string): Promise<PSRunDetailsDO> => {
    let result;

    try {
      result = await repo.getRunById(runId);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rowCount) {
      throw httpErrors.notFound("The requested run was not found");
    }

    if (result.rows[0].organizationId !== organizationId) {
      throw httpErrors.unauthorized("Unauthorized!");
    }

    return result!.rows[0];
  };

const buildGetUserRunById =
  (repo: RunRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (runId: string, userId: string): Promise<UserRunDetailsDO> => {
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
  (repo: RunRepo, log: FastifyBaseLogger) =>
  async (runId: string): Promise<RunStepDO[]> => {
    let result;

    try {
      result = await repo.getRunStepsByRunId(runId);
    } catch (err) {
      log.error((err as Error).message);
    }

    return result?.rows ?? [];
  };

const buildCreateRun =
  (repo: RunRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (journeyId: string, userId: string): Promise<Id> => {
    let result;

    try {
      result = await repo.createRun(journeyId, userId);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rowCount) {
      throw httpErrors.internalServerError("Something went wrong!");
    }

    return result.rows[0];
  };

const buildUpdateRun =
  (repo: RunRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (runId: string, status: RunStatusEnum): Promise<UserRunDetailsDO> => {
    let result;

    try {
      result = await repo.updateRunStatus(runId, status);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rowCount) {
      throw httpErrors.internalServerError("Something went wrong!");
    }

    return result.rows[0];
  };

const buildCreateRunStep =
  (repo: RunRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (runId: string, stepId: string): Promise<Id> => {
    let result;

    try {
      result = await repo.createRunStep(runId, stepId);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rowCount) {
      throw httpErrors.internalServerError("Something went wrong!");
    }

    return result.rows[0];
  };

const buildGetActiveRunStep =
  (repo: RunRepo, log: FastifyBaseLogger) =>
  async (runId: string): Promise<RunStepDO | undefined> => {
    let result;

    try {
      result = await repo.getActiveRunStep(runId);
    } catch (err) {
      log.error((err as Error).message);
    }

    return result?.rows[0];
  };

const buildUpdateRunStep =
  (repo: RunRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (
    runStepId: string,
    runStepData: UpdateRunStepDO,
  ): Promise<RunStepDO> => {
    let result;

    try {
      result = await repo.updateRunStep(runStepId, runStepData);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rowCount) {
      throw httpErrors.internalServerError("Something went wrong!");
    }

    return result?.rows[0];
  };

const buildPlugin = (
  repo: RunRepo,
  log: FastifyBaseLogger,
  httpErrors: HttpErrors,
) => {
  return {
    getUserRuns: buildGetUserRuns(repo, log),
    getUserRunById: buildGetUserRunById(repo, log, httpErrors),
    getRunsByJourneyId: buildGetRunsByJourneyId(repo, log, httpErrors),
    getRunById: buildGetRunById(repo, log, httpErrors),
    getRunStepsByRunId: buildGetRunStepsByRunId(repo, log),
    createRun: buildCreateRun(repo, log, httpErrors),
    updateRun: buildUpdateRun(repo, log, httpErrors),
    createRunStep: buildCreateRunStep(repo, log, httpErrors),
    getActiveRunStep: buildGetActiveRunStep(repo, log),
    updateRunStep: buildUpdateRunStep(repo, log, httpErrors),
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
