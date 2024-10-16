import { PostgresDb } from "@fastify/postgres";
import {
  AuditLogEvent,
  AuditLogEventDetails,
  AuditLogEventsFilters,
  CreateAuditLog,
} from "./types";
import { QueryResult } from "pg";
import { PaginationParams } from "../../types/pagination";

export class AuditLogRepo {
  pg: PostgresDb;

  constructor(pg: PostgresDb) {
    this.pg = pg;
  }

  createEvent(event: CreateAuditLog): Promise<QueryResult<AuditLogEvent>> {
    return this.pg.query(
      `
        INSERT INTO audit_logs (
          event_type,
          user_id,
          organization_id,
          metadata
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          audit_log_id as "auditLogId",
          created_at as "createdAt",
          event_type as "eventType",
          user_id as "userId",
          organization_id as "organizationId",
          metadata
      `,
      [event.eventType, event.userId, event.organizationId, event.metadata],
    );
  }

  getEvents(
    organizationId: string,
    filters: AuditLogEventsFilters,
    pagination: PaginationParams,
  ): Promise<QueryResult<AuditLogEvent>> {
    const params = [pagination.limit, pagination.offset, organizationId];
    const conditions = [`organization_id = $3`];

    if (filters.eventType) {
      params.push(filters.eventType);
      conditions.push(`event_type LIKE $${params.length}`);
    }

    if (filters.userId) {
      params.push(filters.userId);
      conditions.push(`user_id = $${params.length}`);
    }

    if (filters.from) {
      params.push(filters.from);
      conditions.push(`created_at > $${params.length}`);
    }

    if (filters.to) {
      params.push(filters.to);
      conditions.push(`created_at < $${params.length}`);
    }

    return this.pg.query(
      `
        SELECT
          audit_log_id as "auditLogId",
          created_at as "createdAt",
          event_type as "eventType",
          user_id as "userId",
          organization_id as "organizationId",
          metadata
        FROM audit_logs
        WHERE ${conditions.join(" AND ")}
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `,
      params,
    );
  }

  getEventsTotalCount(
    organizationId: string,
    filters: AuditLogEventsFilters,
  ): Promise<QueryResult<{ totalCount: number }>> {
    const params = [organizationId];
    const conditions = [`organization_id = $1`];

    if (filters.eventType) {
      params.push(filters.eventType);
      conditions.push(`event_type LIKE $${params.length}`);
    }

    if (filters.userId) {
      params.push(filters.userId);
      conditions.push(`user_id = $${params.length}`);
    }

    if (filters.from) {
      params.push(filters.from);
      conditions.push(`created_at > $${params.length}`);
    }

    if (filters.to) {
      params.push(filters.to);
      conditions.push(`created_at < $${params.length}`);
    }

    return this.pg.query(
      `
        SELECT
          count(*) as "totalCount"
        FROM audit_logs
        WHERE ${conditions.join(" AND ")}
      `,
      params,
    );
  }

  getEvent(
    eventId: string,
    organizationId: string,
  ): Promise<QueryResult<AuditLogEventDetails>> {
    return this.pg.query(
      `
        SELECT
          audit_log_id as "auditLogId",
          created_at as "createdAt",
          event_type as "eventType",
          user_id as "userId",
          organization_id as "organizationId",
          metadata
        FROM audit_logs
        WHERE audit_log_id = $1 AND organization_id = $2
      `,
      [eventId, organizationId],
    );
  }
}
