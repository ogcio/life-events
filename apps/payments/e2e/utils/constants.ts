export const paymentSetupUrl = "/en/paymentSetup";
export const paymentRequestUrl = `${paymentSetupUrl}/requests`;
export const providersUrl = `${paymentSetupUrl}/providers`;
export const password = "123";
export const myGovIdMockSettings = {
  publicServantEmailDomain: "gov.ie",
  publicServantUser: "Tony Stark",
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
  redirectURLRequired: "Redirect URL is required.",
  statusInvalid:
    "Payment Request Status cannot be active if no providers are selected.",
};
