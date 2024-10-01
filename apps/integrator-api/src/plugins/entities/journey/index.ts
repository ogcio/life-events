import { HttpErrors } from "@fastify/sensible";
import {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyPluginAsync,
} from "fastify";
import fp from "fastify-plugin";
import { JourneyRepo } from "./repo";
import { CreateJourneyBodyDO, JourneyDetailsDO } from "../../../routes/schemas";

export type JourneyPlugin = Awaited<ReturnType<typeof buildPlugin>>;

const buildGetJourneyById =
  (repo: JourneyRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (journeyId: string): Promise<JourneyDetailsDO> => {
    let result;

    try {
      result = await repo.getJourneyById(journeyId);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rowCount) {
      throw httpErrors.notFound("The requested journey was not found");
    }

    return result?.rows[0];
  };

const buildCreateJourney =
  (repo: JourneyRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (journey: CreateJourneyBodyDO): Promise<JourneyDetailsDO> => {
    let result;

    try {
      result = await repo.createJourney(journey);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (result?.rowCount !== 1) {
      throw httpErrors.internalServerError("Cannot create journey");
    }

    return result?.rows[0];
  };

const buildPlugin = (
  repo: JourneyRepo,
  log: FastifyBaseLogger,
  httpErrors: HttpErrors,
) => {
  return {
    getJourneyById: buildGetJourneyById(repo, log, httpErrors),
    createJourney: buildCreateJourney(repo, log, httpErrors),
  };
};

const initPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const repo = new JourneyRepo(fastify.pg);
  const plugin = buildPlugin(repo, fastify.log, fastify.httpErrors);

  fastify.decorate("journey", plugin);
};

export default fp(initPlugin, {
  name: "JourneyPlugin",
});
