import { ProviderType } from "../../app/[locale]/(hosted)/paymentSetup/providers/types";

export const paymentMethods = ["openbanking", "banktransfer", "card"] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export const paymentMethodLabels = [
  "Pay by bank app",
  "Manual Bank Transfer",
  "Credit/Debit card",
] as const;
type PaymentMethodLabel = (typeof paymentMethodLabels)[number];

export const providerPaymentMethodMap: Record<ProviderType, PaymentMethod> = {
  stripe: "card",
  banktransfer: "banktransfer",
  openbanking: "openbanking",
  worldpay: "card",
  realex: "card",
};

export const paymentMethodCheckboxLabelMap: Record<
  PaymentMethod,
  PaymentMethodLabel
> = {
  openbanking: "Pay by bank app",
  banktransfer: "Manual Bank Transfer",
  card: "Credit/Debit card",
};

export const providerTypeAccountLabelMap: Record<ProviderType, string> = {
  stripe: "Stripe Account",
  banktransfer: "Manual Bank Transfer Account",
  openbanking: "OpenBanking Account",
  worldpay: "Worldpay Account",
  realex: "Realex Account",
};
