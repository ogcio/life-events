import { PostgresDb } from "@fastify/postgres";

export enum AuditLogEventType {
  TRANSACTION_CREATE = "transaction.create",
}

export const AuditLogEventTitles: Record<string, string> & {
  [key in AuditLogEventType]: string;
} = {
  [AuditLogEventType.TRANSACTION_CREATE]: "Transaction created",
};

export type AuditLogEvent = {
  auditLogId: string;
  createdAt: string;
  eventType: AuditLogEventType;
  userId?: string;
  organizationId?: string;
  metadata: Record<string, unknown>;
};

export type CreateAuditLog = Pick<
  AuditLogEvent,
  "eventType" | "userId" | "organizationId" | "metadata"
>;

export const createEvent = async (
  pg: PostgresDb,
  event: CreateAuditLog,
): Promise<AuditLogEvent> => {
  const result = await pg.query(
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

  return result.rows[0];
};
