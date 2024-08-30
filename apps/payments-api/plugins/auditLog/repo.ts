import { PostgresDb } from "@fastify/postgres";
import { AuditLogEvent, AuditLogEventDetails, CreateAuditLog } from "./types";
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
    const params = [organizationId, pagination.limit, pagination.offset];
    const conditions = [`organization_id = $1`];

    if (filters.eventType) {
      params.push(filters.eventType);
      conditions.push(`event_type = $4`);
    }

    return this.pg.query(
      `
        SELECT
          audit_log_id as "auditLogId",
          created_at as "createdAt",
          event_type as "eventType",
          user_id as "userId",
          organization_id as "organizationId"
        FROM audit_logs
        WHERE ${conditions.join(" AND ")}
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
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
      conditions.push(`event_type = $2`);
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

  getEvent(eventId: string): Promise<QueryResult<AuditLogEventDetails>> {
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
        WHERE audit_log_id = $1
      `,
      [eventId],
    );
  }
}
