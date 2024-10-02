import { HttpErrors } from "@fastify/sensible";
import {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyPluginAsync,
} from "fastify";
import fp from "fastify-plugin";
import { JourneyRepo } from "./repo";
import {
  CreateJourneyBodyDO,
  FullJourneyDO,
  Id,
  JourneyPublicDetailsDO,
  Journeys,
  JourneyStatusType,
} from "../../../routes/schemas";

export type JourneyPlugin = Awaited<ReturnType<typeof buildPlugin>>;

const buildGetJourneys =
  (repo: JourneyRepo, log: FastifyBaseLogger) =>
  async (organizationId: string): Promise<Journeys> => {
    let result;

    try {
      result = await repo.getJourneys(organizationId);
    } catch (err) {
      log.error((err as Error).message);
    }

    return result?.rows ?? [];
  };

const buildGetJourneyById =
  (repo: JourneyRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (journeyId: string, organizationId: string): Promise<FullJourneyDO> => {
    let result;

    try {
      result = await repo.getJourneyById(journeyId, organizationId);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rowCount) {
      throw httpErrors.notFound("The requested journey was not found");
    }

    return result?.rows[0];
  };

const buildGetJourneyPublicInfo =
  (repo: JourneyRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (journeyId: string): Promise<JourneyPublicDetailsDO> => {
    let result;

    try {
      result = await repo.getJourneyPublicInfo(journeyId);
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
  async (journey: CreateJourneyBodyDO): Promise<JourneyPublicDetailsDO> => {
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

const buildUpdateJourneyStatus =
  (repo: JourneyRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (data: {
    journeyId: string;
    status: JourneyStatusType;
    organizationId: string;
  }): Promise<Id> => {
    let result;

    try {
      result = await repo.updateJourneyStatus(data);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rows[0]?.id) {
      throw httpErrors.internalServerError("Something went wrong!");
    }

    return result?.rows[0];
  };

const buildPlugin = (
  repo: JourneyRepo,
  log: FastifyBaseLogger,
  httpErrors: HttpErrors,
) => {
  return {
    getJourneys: buildGetJourneys(repo, log),
    getJourneyById: buildGetJourneyById(repo, log, httpErrors),
    getJourneyPublicInfo: buildGetJourneyPublicInfo(repo, log, httpErrors),
    createJourney: buildCreateJourney(repo, log, httpErrors),
    updateJourneyStatus: buildUpdateJourneyStatus(repo, log, httpErrors),
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
