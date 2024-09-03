import { AuditLogEventType } from "./auditLogEvents";

export type AuditLogEvent = {
  auditLogId: string;
  createdAt: string;
  eventType: AuditLogEventType;
  userId?: string;
  organizationId?: string;
  metadata: Record<string, unknown>;
};

export type AuditLogEventDetails = AuditLogEvent & {
  metadata: Record<string, unknown>;
};

export type AuditLogEventDO = AuditLogEvent & {
  title: string;
  resourceId?: string;
};

export type AuditLogEventDetailsDO = AuditLogEventDetails & {
  title: string;
};

export type CreateAuditLog = Pick<
  AuditLogEventDetails,
  "eventType" | "userId" | "organizationId" | "metadata"
>;

export type AuditLogEventsFilters = {
  eventType?: string;
};
