export const paymentSetupUrl = "/en/paymentSetup";
export const paymentRequestUrl = `${paymentSetupUrl}/requests`;
export const providersUrl = `${paymentSetupUrl}/providers`;
export const password = "123";
export const myGovIdMockSettings = {
  publicServantEmailDomain: "gov.ie",
  publicServantUser: "Tony Stark",
};

export const validationErrorTexts: Record<string, string> = {
  accountHolderNameRequired: "Bank Account Holder Name is required.",
  ibanRequired: "IBAN is required.",
  ibanInvalid: "IBAN is not valid.",
};
