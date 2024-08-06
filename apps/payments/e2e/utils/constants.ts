export const paymentSetupUrl = "/en/paymentSetup";
export const paymentRequestUrl = `${paymentSetupUrl}/requests`;
export const providersUrl = `${paymentSetupUrl}/providers`;
export const password = "123";
export const myGovIdMockSettings = {
  publicServantEmailDomain: "gov.ie",
  publicServantUser: "Tony Stark",
};

export const providerValidationErrorTexts: Record<ValidationError, string> = {
  nameRequired: "Name is required.",
  accountHolderNameRequired: "Bank Account Holder Name is required.",
  ibanRequired: "IBAN is required.",
  ibanInvalid: "IBAN is not valid.",
  publishableKeyRequired: "Live Publishable Key is required.",
  secretKeyRequired: "Live Secret Key is required.",
  merchantIdRequired: "Merchant Id is required.",
  sharedSecretRequired: "Shared Secret is required.",
};

export type StripeValidationError =
  | "nameRequired"
  | "publishableKeyRequired"
  | "secretKeyRequired";

export type BankTransferValidationError =
  | "nameRequired"
  | "accountHolderNameRequired"
  | "ibanRequired"
  | "ibanInvalid";

export type RealexValidationError =
  | "nameRequired"
  | "merchantIdRequired"
  | "sharedSecretRequired";

type ValidationError =
  | StripeValidationError
  | BankTransferValidationError
  | RealexValidationError;
