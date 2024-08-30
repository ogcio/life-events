import {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyPluginAsync,
} from "fastify";
import fp from "fastify-plugin";
import { AuditLogRepo } from "./repo";
import { AuditLogEvent, AuditLogEventDO, CreateAuditLog } from "./types";
import { PaginationParams } from "../../types/pagination";
import { AuditLogEventTitles, AuditLogEventType } from "./auditLogEvents";

export type AuditLogPlugin = Awaited<ReturnType<typeof buildPlugin>>;

const getEventTitle = (eventType: AuditLogEventType) => {
  return AuditLogEventTitles[eventType];
};

const buildCreateEvent =
  (repo: AuditLogRepo, log: FastifyBaseLogger) =>
  async (event: CreateAuditLog): Promise<AuditLogEventDO> => {
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

    const createdEvent: AuditLogEventDO = {
      ...result.rows[0],
      title: getEventTitle(result.rows[0].eventType),
    };

    return createdEvent;
  };

const buildGetEvents =
  (repo: AuditLogRepo, log: FastifyBaseLogger) =>
  async (
    organizationId: string,
    pagination: PaginationParams,
  ): Promise<AuditLogEvent[]> => {
    let result;

    try {
      result = await repo.getEvents(organizationId, pagination);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rows.length) {
      return [];
    }

    return result.rows.map((event) => {
      return {
        ...event,
        title: getEventTitle(event.eventType),
      };
    });
  };

const buildGetEventsTotalCount =
  (repo: AuditLogRepo, log: FastifyBaseLogger) =>
  async (organizationId: string): Promise<number> => {
    let result;

    try {
      result = await repo.getEventsTotalCount(organizationId);
    } catch (err) {
      log.error((err as Error).message);
    }

    const totalCount = result?.rows[0].totalCount;

    if (totalCount === undefined) {
      const error = new Error("Something went wrong.");
      throw error;
    }

    return totalCount;
  };

const buildPlugin = (repo: AuditLogRepo, log: FastifyBaseLogger) => {
  return {
    createEvent: buildCreateEvent(repo, log),
    getEvents: buildGetEvents(repo, log),
    buildGetEventsTotalCount: buildGetEventsTotalCount(repo, log),
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
