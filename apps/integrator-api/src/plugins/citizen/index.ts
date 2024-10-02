import { HttpErrors } from "@fastify/sensible";
import {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyPluginAsync,
} from "fastify";
import fp from "fastify-plugin";
import { CitizenRepo } from "./repo";
import { JourneyDetailsDO } from "../../routes/schemas";

export type CitizenPlugin = Awaited<ReturnType<typeof buildPlugin>>;

const buildGetJourneyById =
  (repo: CitizenRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
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

const buildPlugin = (
  repo: CitizenRepo,
  log: FastifyBaseLogger,
  httpErrors: HttpErrors,
) => {
  return {
    getJourneyById: buildGetJourneyById(repo, log, httpErrors),
  };
};

const initPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const repo = new CitizenRepo(fastify.pg);
  const plugin = buildPlugin(repo, fastify.log, fastify.httpErrors);

  fastify.decorate("citizen", plugin);
};

export default fp(initPlugin, {
  name: "citizenPlugin",
});
