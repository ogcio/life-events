export const providerTypes = ["openbanking", "banktransfer", "stripe"] as const;
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

export type ProviderData = OpenBankingData | BankTransferData | StripeData;

export type Provider = {
  id: string;
  name: string;
  userId?: string;
  type: ProviderType;
  status: ProviderStatus;
  providerData: ProviderData;
};

export const parseProvider = (rawProvider: any): Provider => ({
  id: rawProvider.provider_id,
  name: rawProvider.provider_name,
  type: rawProvider.provider_type,
  providerData: rawProvider.provider_data,
  status: rawProvider.status,
});
