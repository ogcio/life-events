import { Static, Type } from "@sinclair/typebox";
import {
  BankTransferData,
  CreateProvider,
  OpenBankingData,
  ParamsWithProviderId,
  Provider,
  ProviderData,
  ProviderReply,
  ProviderStatus,
  ProviderTypes,
  RealexData,
  RealexEncryptedData,
  StripeData,
  StripeEncryptedData,
  UpdateProvider,
  WorldpayData,
  WorldpayEncryptedData,
} from "../../../routes/schemas";

export type OpenBankingData = Static<typeof OpenBankingData>;
export type BankTransferData = Static<typeof BankTransferData>;
export type StripeData = Static<typeof StripeData>;
export type WorldpayData = Static<typeof WorldpayData>;
export type RealexData = Static<typeof RealexData>;
export type ProviderData = Static<typeof ProviderData>;

export type ParamsWithProviderId = Static<typeof ParamsWithProviderId>;

export type ProviderStatus = Static<typeof ProviderStatus>;
export type ProviderTypes = Static<typeof ProviderTypes>;

export type ProviderDO = Static<typeof ProviderReply>;
export type UpdateProviderDO = Static<typeof UpdateProvider>;
export type CreateProviderDO = Static<typeof CreateProvider>;
