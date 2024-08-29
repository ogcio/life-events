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
