export const providerTypes = [
  "openbanking",
  "banktransfer",
  "stripe",
  "worldpay",
] as const;
export type ProviderType = (typeof providerTypes)[number];
export type ProviderStatus = "connected" | "disconnected";

export type OpenBankingData = {
  iban: string;
  accountHolderName: string;
};

export type BankTransferData = {
  iban: string;
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
  type: string;
  createdAt: string;
};

export type StripeProvider = CommonProvider & {
  data: StripeData;
};

export type OpenBankingProvider = CommonProvider & {
  data: OpenBankingData;
};

export type BankTransferProvider = CommonProvider & {
  data: BankTransferData;
};

export type WorldpayProvider = CommonProvider & {
  data: WorldpayData;
};

export type Provider =
  | StripeProvider
  | OpenBankingProvider
  | BankTransferProvider
  | WorldpayProvider;
