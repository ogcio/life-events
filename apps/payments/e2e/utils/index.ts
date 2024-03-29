import { ProviderType } from "../../app/[locale]/(hosted)/paymentSetup/providers/types";

export const providerTypeAccountLabelMap: Record<ProviderType, string> = {
  stripe: "Stripe Account",
  banktransfer: "Manual Bank Transfer Account",
  openbanking: "OpenBanking Account",
  worldpay: "Worldpay Account",
};
