import {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyPluginAsync,
} from "fastify";
import fp from "fastify-plugin";
import { AuditLogRepo } from "./repo";
import { AuditLogEvent, CreateAuditLog } from "./types";

export type AuditLogPlugin = Awaited<ReturnType<typeof buildPlugin>>;

const buildCreateEvent =
  (repo: AuditLogRepo, log: FastifyBaseLogger) =>
  async (event: CreateAuditLog): Promise<AuditLogEvent> => {
    let result;

    try {
      result = await repo.createEvent(event);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rows?.[0]) {
      const error = new Error("Something went wrong during event creation");
      throw error;
    }

    return result.rows[0];
  };

const buildPlugin = (repo: AuditLogRepo, log: FastifyBaseLogger) => {
  return {
    createEvent: buildCreateEvent(repo, log),
  };
};

const initPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const repo = new AuditLogRepo(fastify.pg);
  const plugin = buildPlugin(repo, fastify.log);

  fastify.decorate("auditLog", plugin);
};

export default fp(initPlugin, {
  name: "auditLogPlugin",
});
