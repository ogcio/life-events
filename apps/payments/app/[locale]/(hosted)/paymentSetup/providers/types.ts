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
  status: string;
};

export type StripeProvider = CommonProvider & {
  type: string;
  data: StripeData;
};

export type OpenBankingProvider = CommonProvider & {
  type: string;
  data: OpenBankingData;
};

export type BankTransferProvider = CommonProvider & {
  type: string;
  data: BankTransferData;
};

export type WorldpayProvider = CommonProvider & {
  type: string;
  data: WorldpayData;
};

export type Provider =
  | StripeProvider
  | OpenBankingProvider
  | BankTransferProvider
  | WorldpayProvider;
