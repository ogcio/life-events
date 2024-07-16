export enum authPermissions {
  PROVIDER_PUBLIC_READ = "payments:provider.public:read",
  PROVIDER_ALL = "payments:provider:*",
  PAYMENT_REQUEST_PUBLIC_READ = "payments:payment_request.public:read",
  PAYMENT_REQUEST_ALL = "payments:payment_request:*",
  TRANSACTION_SELF_WRITE = "payments:transaction.self:write",
  TRANSACTION_SELF_READ = "payments:transaction.self:read",
  TRANSACTION_ALL = "payments:transaction:*",
}
