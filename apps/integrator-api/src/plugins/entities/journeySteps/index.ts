import { HttpErrors } from "@fastify/sensible";
import {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyPluginAsync,
} from "fastify";
import fp from "fastify-plugin";
import { JourneyStepsRepo } from "./repo";
import {
  CreateJourneyStepDO,
  JourneyStepDO,
  UpdateJourneyStepDO,
} from "./types";

export type JourneyStepsPlugin = Awaited<ReturnType<typeof buildPlugin>>;

const buildGetStepById =
  (repo: JourneyStepsRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (stepId: string): Promise<JourneyStepDO> => {
    let result;

    try {
      result = await repo.getStepById(stepId);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rowCount) {
      throw httpErrors.notFound("The requested journey step was not found");
    }

    return result?.rows[0];
  };

const buildGetJourneySteps =
  (repo: JourneyStepsRepo, log: FastifyBaseLogger) =>
  async (journeyId: string): Promise<JourneyStepDO[]> => {
    let result;

    try {
      result = await repo.getStepsByJourneyId(journeyId);
    } catch (err) {
      log.error((err as Error).message);
    }

    return result?.rows ?? [];
  };

const buildCreateStep =
  (repo: JourneyStepsRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (step: CreateJourneyStepDO): Promise<JourneyStepDO> => {
    let result;

    try {
      result = await repo.createStep(step);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rows?.[0]) {
      throw httpErrors.internalServerError(
        "Something went wrong during journey step creation",
      );
    }

    return result?.rows[0];
  };

const buildDeleteStep =
  (repo: JourneyStepsRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (stepId: string): Promise<boolean> => {
    let result;

    try {
      result = await repo.deleteStep(stepId);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rows?.[0]) {
      throw httpErrors.internalServerError(
        "Something went wrong during journey step deletion",
      );
    }

    return result?.rows[0] ? true : false;
  };

const buildUpdateStep =
  (repo: JourneyStepsRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (stepId: string, step: UpdateJourneyStepDO): Promise<JourneyStepDO> => {
    let result;

    try {
      result = await repo.updateStep(stepId, step);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rows?.[0]) {
      throw httpErrors.internalServerError(
        "Something went wrong during journey step update",
      );
    }

    return result?.rows[0];
  };

const buildPlugin = (
  repo: JourneyStepsRepo,
  log: FastifyBaseLogger,
  httpErrors: HttpErrors,
) => {
  return {
    getStepById: buildGetStepById(repo, log, httpErrors),
    getJourneySteps: buildGetJourneySteps(repo, log),
    createStep: buildCreateStep(repo, log, httpErrors),
    deleteStep: buildDeleteStep(repo, log, httpErrors),
    updateStep: buildUpdateStep(repo, log, httpErrors),
  };
};

const initPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const repo = new JourneyStepsRepo(fastify.pg);
  const plugin = buildPlugin(repo, fastify.log, fastify.httpErrors);

  fastify.decorate("journeySteps", plugin);
};

export default fp(initPlugin, {
  name: "JourneyStepsPlugin",
});
