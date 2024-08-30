import { PostgresDb } from "@fastify/postgres";
import { AuditLogEvent, CreateAuditLog } from "./types";
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
    pagination: PaginationParams,
  ): Promise<QueryResult<AuditLogEvent>> {
    return this.pg.query(
      `
        SELECT
          audit_log_id as "auditLogId",
          created_at as "createdAt",
          event_type as "eventType",
          user_id as "userId",
          organization_id as "organizationId"
        FROM audit_logs
        WHERE organization_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `,
      [organizationId, pagination.limit, pagination.offset],
    );
  }

  getEventsTotalCount(
    organizationId: string,
  ): Promise<QueryResult<{ totalCount: number }>> {
    return this.pg.query(
      `
        SELECT
          count(*) as "totalCount"
        FROM audit_logs
        WHERE organization_id = $1
      `,
      [organizationId],
    );
  }
}
