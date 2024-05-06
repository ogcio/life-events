import { Static, Type } from "@sinclair/typebox";

/**
 * Provider Data types
 */

export const OpenBankingData = Type.Object({
  iban: Type.String({ validator: "IBANValidator" }),
  accountHolderName: Type.String(),
});
export type OpenBankingData = Static<typeof OpenBankingData>;

export const BankTransferData = Type.Object({
  iban: Type.String({ validator: "IBANValidator" }),
  accountHolderName: Type.String(),
});
export type BankTransferData = Static<typeof BankTransferData>;

export const StripeData = Type.Object({
  livePublishableKey: Type.String(),
  liveSecretKey: Type.String(),
});
export type StripeData = Static<typeof StripeData>;

export const StripeEncryptedData = Type.Object({
  livePublishableKey: Type.String(),
  encryptedLiveSecretKey: Type.String(),
});
export type StripeEncryptedData = Static<typeof StripeEncryptedData>;

export const WorldpayData = Type.Object({
  merchantCode: Type.String(),
  installationId: Type.String(),
});
export type WorldpayData = Static<typeof WorldpayData>;

export const WorldpayEncryptedData = Type.Object({
  installationId: Type.String(),
  encryptedMerchantCode: Type.String(),
});
export type WorldpayEncryptedData = Static<typeof WorldpayEncryptedData>;

export const RealexData = Type.Object({
  merchantId: Type.String(),
  sharedSecret: Type.String(),
});
export type RealexData = Static<typeof RealexData>;

export const RealexEncryptedData = Type.Object({
  merchantId: Type.String(),
  encryptedSharedSecret: Type.String(),
});
export type RealexEncryptedData = Static<typeof RealexEncryptedData>;

/**
 * Providers types
 */
export const ProviderStatus = Type.Union([
  Type.Literal("connected"),
  Type.Literal("disconnected"),
]);
export type ProviderStatus = Static<typeof ProviderStatus>;

export const BankTransferProvider = Type.Object({
  id: Type.String(),
  name: Type.String(),
  type: Type.Literal("banktransfer"),
  data: BankTransferData,
  status: ProviderStatus,
});

export const OpenBankingProvider = Type.Object({
  id: Type.String(),
  name: Type.String(),
  type: Type.Literal("openbanking"),
  data: OpenBankingData,
  status: ProviderStatus,
});

export const StripeProvider = Type.Object({
  id: Type.String(),
  name: Type.String(),
  type: Type.Literal("stripe"),
  data: StripeData,
  status: ProviderStatus,
});

export const WorldpayProvider = Type.Object({
  id: Type.String(),
  name: Type.String(),
  type: Type.Literal("worldpay"),
  data: WorldpayData,
  status: ProviderStatus,
});

export const RealexProvider = Type.Object({
  id: Type.String(),
  name: Type.String(),
  type: Type.Literal("realex"),
  data: RealexData,
  status: ProviderStatus,
});

export const Provider = Type.Union([
  BankTransferProvider,
  OpenBankingProvider,
  StripeProvider,
  WorldpayProvider,
  RealexProvider,
]);
export type Provider = Static<typeof Provider>;

export const CreateBankTransferProvider = Type.Omit(BankTransferProvider, [
  "id",
  "status",
]);
export type CreateBankTransferProvider = Static<
  typeof CreateBankTransferProvider
>;

export const CreateOpenBankingProvider = Type.Omit(OpenBankingProvider, [
  "id",
  "status",
]);
export type CreateOpenBankingProvider = Static<
  typeof CreateOpenBankingProvider
>;

export const CreateStripeProvider = Type.Omit(StripeProvider, ["id", "status"]);
export type CreateStripeProvider = Static<typeof CreateStripeProvider>;

export const CreateWorldpayProvider = Type.Omit(WorldpayProvider, [
  "id",
  "status",
]);
export type CreateWorldpayProvider = Static<typeof CreateWorldpayProvider>;

export const CreateRealexProvider = Type.Omit(RealexProvider, ["id", "status"]);
export type CreateRealexProvider = Static<typeof CreateRealexProvider>;

export const ProvidersList = Type.Union([Type.Array(Provider)]);
export type ProvidersList = Static<typeof ProvidersList>;

// TEMPORARILY CREATE NEW TYPE WITHOUT VALIDATIONS.
export const UpdateProvider = Type.Object({
  name: Type.String(),
  data: Type.Any(),
  status: ProviderStatus,
});
// export const UpdateProvider = Type.Omit(Provider, ["id", "type"]);
export type UpdateProvider = Static<typeof UpdateProvider>;

export const ParamsWithProviderId = Type.Object({
  providerId: Type.String(),
});
export type ParamsWithProviderId = Static<typeof ParamsWithProviderId>;

/**
 * Payment requests types
 */

export const ProviderDetails = Type.Object({
  userId: Type.String(),
  id: Type.String(),
  name: Type.String(),
  type: Type.Union([
    Type.Literal("banktransfer"),
    Type.Literal("openbanking"),
    Type.Literal("stripe"),
    Type.Literal("realex"),
  ]),
  status: ProviderStatus,
  data: Type.Any(),
  createdAt: Type.String(),
});

export const PaymentRequest = Type.Object({
  paymentRequestId: Type.String(),
  title: Type.String(),
  description: Type.String(),
  amount: Type.Number(),
  reference: Type.String(),
  providers: Type.Array(ProviderDetails),
});
export type PaymentRequest = Static<typeof PaymentRequest>;

export const PaymentRequestDetails = Type.Composite([
  PaymentRequest,
  Type.Object({
    redirectUrl: Type.String(),
    allowAmountOverride: Type.Boolean(),
    allowCustomAmount: Type.Boolean(),
  }),
]);
export type PaymentRequestDetails = Static<typeof PaymentRequestDetails>;

export const CreatePaymentRequest = Type.Object({
  title: Type.String(),
  description: Type.String(),
  reference: Type.String(),
  amount: Type.Number(),
  redirectUrl: Type.String(),
  allowAmountOverride: Type.Boolean(),
  allowCustomAmount: Type.Boolean(),
  providers: Type.Array(Type.String()),
});
export type CreatePaymentRequest = Static<typeof CreatePaymentRequest>;

export const EditPaymentRequest = Type.Composite([
  Type.Omit(CreatePaymentRequest, ["providers"]),
  Type.Object({
    paymentRequestId: Type.String(),
    providersUpdate: Type.Object({
      toDisable: Type.Array(Type.String()),
      toCreate: Type.Array(Type.String()),
    }),
  }),
]);
export type EditPaymentRequest = Static<typeof EditPaymentRequest>;

export const ParamsWithPaymentRequestId = Type.Object({
  requestId: Type.String(),
});
export type ParamsWithPaymentRequestId = Static<
  typeof ParamsWithPaymentRequestId
>;

/**
 * Transaction status
 */
export enum TransactionStatusesEnum {
  Initiated = "initiated",
  Pending = "pending",
  Succeeded = "succeeded",
  Cancelled = "cancelled",
  Failed = "failed",
}

export const TransactionStatuses = Type.Union([
  Type.Literal("initiated"),
  Type.Literal("pending"),
  Type.Literal("succeeded"),
  Type.Literal("cancelled"),
  Type.Literal("failed"),
]);
export type TransactionStatuses = Static<typeof TransactionStatuses>;

/**
 * Transactions types
 */

export const FullTransaction = Type.Object({
  transactionId: Type.String(),
  paymentRequestId: Type.String(),
  extPaymentId: Type.String(),
  status: TransactionStatuses,
  integrationReference: Type.String(),
  amount: Type.Number(),
  paymentProviderId: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
  userId: Type.String(),
  userData: Type.Object({
    name: Type.String(),
    email: Type.String(),
  }),
});
export type FullTransaction = Static<typeof FullTransaction>;

export const Transaction = Type.Composite([
  Type.Pick(FullTransaction, [
    "transactionId",
    "status",
    "amount",
    "updatedAt",
  ]),
  Type.Object({
    title: Type.String(),
  }),
]);
export type Transaction = Static<typeof Transaction>;

export const TransactionDetails = Type.Composite([
  Transaction,
  Type.Pick(FullTransaction, ["extPaymentId", "userId", "userData"]),
  Type.Object({
    providerName: Type.String(),
    providerType: Type.String(),
    paymentRequestId: Type.String(),
  }),
]);
export type TransactionDetails = Static<typeof TransactionDetails>;

export const Transactions = Type.Array(TransactionDetails);
export type Transactions = Static<typeof Transactions>;

export const UpdateTransactionBody = Type.Pick(Transaction, ["status"]);
export type UpdateTransactionBody = Static<typeof UpdateTransactionBody>;

export const CreateTransactionBody = Type.Omit(FullTransaction, [
  "transactionId",
  "status",
  "createdAt",
  "updatedAt",
  "userId",
]);
export type CreateTransactionBody = Static<typeof CreateTransactionBody>;

export const ParamsWithTransactionId = Type.Object({
  transactionId: Type.String(),
});
export type ParamsWithTransactionId = Static<typeof ParamsWithTransactionId>;

export const PaymentIntentId = Type.Object({
  intentId: Type.String(),
});
export type PaymentIntentId = Static<typeof PaymentIntentId>;

/**
 * Realex integration types
 */

export const RealexPaymentObject = Type.Object({
  ACCOUNT: Type.String(),
  AMOUNT: Type.String(),
  CURRENCY: Type.String(),
  MERCHANT_ID: Type.String(),
  ORDER_ID: Type.String(),
  TIMESTAMP: Type.String(),
  URL: Type.String(),
  SHA256HASH: Type.String(),
});
export type RealexPaymentObject = Static<typeof RealexPaymentObject>;

export const RealexPaymentObjectQueryParams = Type.Object({
  amount: Type.String(),
  intentId: Type.String(),
  providerId: Type.String(),
});
export type RealexPaymentObjectQueryParams = Static<
  typeof RealexPaymentObjectQueryParams
>;

export const RealexHppResponse = Type.Object({
  RESULT: Type.String(),
  AUTHCODE: Type.String(),
  MESSAGE: Type.String(),
  PASREF: Type.String(),
  AVSPOSTCODERESULT: Type.String(),
  AVSADDRESSRESULT: Type.String(),
  CVNRESULT: Type.String(),
  ACCOUNT: Type.String(),
  MERCHANT_ID: Type.String(),
  ORDER_ID: Type.String(),
  TIMESTAMP: Type.String(),
  AMOUNT: Type.String(),
  MERCHANT_RESPONSE_URL: Type.String(),
  HPP_LANG: Type.String(),
  pas_uuid: Type.String(),
  HPP_CUSTOMER_COUNTRY: Type.String(),
  HPP_CUSTOMER_PHONENUMBER_MOBILE: Type.String(),
  BILLING_CODE: Type.String(),
  BILLING_CO: Type.String(),
  ECI: Type.String(),
  CAVV: Type.String(),
  XID: Type.String(),
  DS_TRANS_ID: Type.String(),
  AUTHENTICATION_VALUE: Type.String(),
  MESSAGE_VERSION: Type.String(),
  SRD: Type.String(),
  SHA256HASH: Type.String(),
  HPP_BILLING_STREET1: Type.String(),
  HPP_BILLING_STREET2: Type.String(),
  HPP_BILLING_STREET3: Type.String(),
  HPP_BILLING_CITY: Type.String(),
  HPP_BILLING_COUNTRY: Type.String(),
  HPP_BILLING_POSTALCODE: Type.String(),
  HPP_CUSTOMER_FIRSTNAME: Type.String(),
  HPP_CUSTOMER_LASTNAME: Type.String(),
  HPP_CUSTOMER_EMAIL: Type.String(),
  HPP_ADDRESS_MATCH_INDICATOR: Type.String(),
  BATCHID: Type.String(),
});
export type RealexHppResponse = Static<typeof RealexHppResponse>;

/**
 * Citizen
 */

export const CitizenTransactions = Type.Array(
  Type.Pick(Transaction, [
    "transactionId",
    "status",
    "title",
    "updatedAt",
    "amount",
  ]),
);
export type CitizenTransactions = Static<typeof CitizenTransactions>;
