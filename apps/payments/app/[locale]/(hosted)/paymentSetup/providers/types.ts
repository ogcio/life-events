export const providerTypes = [
  "openbanking",
  "banktransfer",
  "stripe",
  "worldpay",
] as const;
export type ProviderType = (typeof providerTypes)[number];
export type ProviderStatus = "connected" | "disconnected";

export type OpenBankingData = {
  sortCode: string;
  accountNumber: string;
  accountHolderName: string;
};

export type BankTransferData = {
  sortCode: string;
  accountNumber: string;
  accountHolderName: string;
};

export type StripeData = {
  livePublishableKey: string;
  liveSecretKey: string;
};

export type WorldpayData = {
  merchantCode: string;
  installationId: string;
};

export type ProviderData =
  | OpenBankingData
  | BankTransferData
  | StripeData
  | WorldpayData;

export type CommonProvider = {
  id: string;
  name: string;
  userId?: string;
  status: ProviderStatus;
};

export type StripeProvider = CommonProvider & {
  type: "stripe";
  data: StripeData;
};

export type OpenBankingProvider = CommonProvider & {
  type: "openbanking";
  data: OpenBankingData;
};

export type BankTransferProvider = CommonProvider & {
  type: "banktransfer";
  data: BankTransferData;
};

export type WorldpayProvider = CommonProvider & {
  type: "worldpay";
  data: WorldpayData;
};

export type Provider =
  | StripeProvider
  | OpenBankingProvider
  | BankTransferProvider
  | WorldpayProvider;
