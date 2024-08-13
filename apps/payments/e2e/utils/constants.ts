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
