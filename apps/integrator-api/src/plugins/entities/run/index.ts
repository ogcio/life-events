import { HttpErrors } from "@fastify/sensible";
import {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyPluginAsync,
} from "fastify";
import fp from "fastify-plugin";
import { RunRepo } from "./repo";
import { RunDO } from "./types";

export type RunPlugin = Awaited<ReturnType<typeof buildPlugin>>;

const buildGetRuns =
  (repo: RunRepo, log: FastifyBaseLogger) =>
  async (userId: string): Promise<RunDO[]> => {
    let result;

    try {
      result = await repo.getRuns(userId);
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
    getRuns: buildGetRuns(repo, log),
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
