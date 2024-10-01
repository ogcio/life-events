import { Static } from "@sinclair/typebox";
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
  RealexHppResponse,
  RealexStatusUpdateQueryParams,
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

export type RealexPaymentObjectDO = Static<typeof RealexPaymentObject>;
export type RealexHppResponseDO = Static<typeof RealexHppResponse>;

export type RealexStatusUpdateDO = Static<typeof RealexStatusUpdateQueryParams>;

export enum RealexStatusEnum {
  SUCCESSFUL = "00",
  PENDING = "01",
  DECLINED = "100",
  INSUFFICIENT_FUNDS = "101",
  FAILURE = "199",
  UNKNOWN = "330",
  VARIOUS_FAILURE = "550",
}
