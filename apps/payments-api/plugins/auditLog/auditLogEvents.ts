export enum AuditLogEventType {
  TRANSACTION_CREATE = "transaction.create",
  TRANSACTION_STATUS_UPDATE = "transaction.status_update",
  PROVIDER_CREATE = "provider.create",
  PROVIDER_UPDATE = "provider.update",
  PAYMENT_REQUEST_CREATE = "payment_request.create",
  PAYMENT_REQUEST_UPDATE = "payment_request.update",
  PAYMENT_REQUEST_DELETE = "payment_request.delete",
}

export const AuditLogEventTitles: Record<string, string> & {
  [key in AuditLogEventType]: string;
} = {
  [AuditLogEventType.TRANSACTION_CREATE]: "Transaction created",
  [AuditLogEventType.TRANSACTION_STATUS_UPDATE]: "Transaction status updated",
  [AuditLogEventType.PROVIDER_CREATE]: "Provider created",
  [AuditLogEventType.PROVIDER_UPDATE]: "Provider updated",
  [AuditLogEventType.PAYMENT_REQUEST_CREATE]: "Payment request created",
  [AuditLogEventType.PAYMENT_REQUEST_UPDATE]: "Payment request updated",
  [AuditLogEventType.PAYMENT_REQUEST_DELETE]: "Payment request deleted",
};
