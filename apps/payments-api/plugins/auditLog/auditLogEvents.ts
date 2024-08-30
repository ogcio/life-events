export enum AuditLogEventType {
  TRANSACTION_CREATE = "transaction.create",
  PROVIDER_CREATE = "provider.create",
}

export const AuditLogEventTitles: Record<string, string> & {
  [key in AuditLogEventType]: string;
} = {
  [AuditLogEventType.TRANSACTION_CREATE]: "Transaction created",
  [AuditLogEventType.PROVIDER_CREATE]: "Provider created",
};
