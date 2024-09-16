export const paymentSetupUrl = "/en/paymentSetup";
export const paymentRequestUrl = `${paymentSetupUrl}/requests`;
export const providersUrl = `${paymentSetupUrl}/providers`;
export const landingPageUrl = "/en/info";
export const landingPage2Url = "http://localhost:3004/en/payments";

export const password = "123";
export const citizens = ["Peter Parker", "Bruce Wayne"];
export const publicServants = ["Tony Stark", "John Doe"];
export const inactivePublicServant = "Flash Gordon";
export const myGovIdMockSettings = {
  publicServantEmailDomain: "gov.ie",
  citizenEmailDomain: "mail.ie",
};

export const referenceCodeSearchParam = {
  openBanking: "payment_id",
  stripe: "payment_intent",
  realex: "order_id",
};

export const BankTransferProviderValidationErrors = [
  "nameRequired",
  "accountHolderNameRequired",
  "ibanRequired",
  "ibanInvalid",
] as const;

export type BankTransferProviderValidationError =
  (typeof BankTransferProviderValidationErrors)[number];

export const StripeProviderValidationErrors = [
  "nameRequired",
  "publishableKeyRequired",
  "secretKeyRequired",
] as const;

export type StripeProviderValidationError =
  (typeof StripeProviderValidationErrors)[number];

export const RealexProviderValidationErrors = [
  "nameRequired",
  "merchantIdRequired",
  "sharedSecretRequired",
] as const;

export type RealexProviderValidationError =
  (typeof RealexProviderValidationErrors)[number];

type ProviderValidationError =
  | StripeProviderValidationError
  | BankTransferProviderValidationError
  | RealexProviderValidationError;

export const providerValidationErrorTexts: Record<
  ProviderValidationError,
  string
> = {
  nameRequired: "Name is required.",
  accountHolderNameRequired: "Bank Account Holder Name is required.",
  ibanRequired: "IBAN is required.",
  ibanInvalid: "IBAN is not valid.",
  publishableKeyRequired: "Live Publishable Key is required.",
  secretKeyRequired: "Live Secret Key is required.",
  merchantIdRequired: "Merchant Id is required.",
  sharedSecretRequired: "Shared Secret is required.",
};

export const PaymentRequestValidationErrors = [
  "titleRequired",
  "referenceRequired",
  "amountRequired",
  "amountMaximum",
  "redirectURLRequired",
  "statusInvalid",
] as const;

export type PaymentRequestValidationError =
  (typeof PaymentRequestValidationErrors)[number];

export const paymentRequestValidationErrorTexts: Record<
  PaymentRequestValidationError,
  string
> = {
  titleRequired: "Title is required.",
  referenceRequired: "Reference is required.",
  amountRequired: "Amount is required.",
  amountMaximum: "Amount must be less than 10000.",
  redirectURLRequired: "Redirect URL is required.",
  statusInvalid:
    "Payment Request Status cannot be active if no providers are selected.",
};

export const SAFE_PID_FILENAME = "ngrok.pid";

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

export type AuditLogResourceType =
  | "provider"
  | "transaction"
  | "payment_request";

export const ORGANISATIONS = [
  { name: "First Testing Organisation", id: "first-testing" },
  { name: "Second Testing Organisation", id: "second-testing" },
];
