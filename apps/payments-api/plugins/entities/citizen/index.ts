import { HttpErrors } from "@fastify/sensible";
import {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyPluginAsync,
} from "fastify";
import fp from "fastify-plugin";
import { CitizenRepo } from "./repo";
import { CitizenTransactionDO } from "./types";
import { PaginationParams } from "../../../types/pagination";

export type CitizenPlugin = Awaited<ReturnType<typeof buildPlugin>>;

const buildGetTransactions =
  (repo: CitizenRepo, log: FastifyBaseLogger) =>
  async (
    userId: string,
    pagination: PaginationParams,
  ): Promise<CitizenTransactionDO[]> => {
    let result;

    try {
      result = await repo.getTransactions(userId, pagination);
    } catch (err) {
      log.error((err as Error).message);
    }

    return result?.rows ?? [];
  };

const buildGetTransactionsTotalCount =
  (repo: CitizenRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (userId: string): Promise<number> => {
    let result;

    try {
      result = await repo.getTransactionsTotalCount(userId);
    } catch (err) {
      log.error((err as Error).message);
    }

    const totalCount = result?.rows[0].totalCount;

    if (totalCount === undefined) {
      throw httpErrors.internalServerError("Something went wrong.");
    }

    return totalCount;
  };

const buildPlugin = (
  repo: CitizenRepo,
  log: FastifyBaseLogger,
  httpErrors: HttpErrors,
) => {
  return {
    getTransactions: buildGetTransactions(repo, log),
    getTransactionsTotalCount: buildGetTransactionsTotalCount(
      repo,
      log,
      httpErrors,
    ),
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
