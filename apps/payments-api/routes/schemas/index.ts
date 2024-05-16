import { Static, TSchema, Type } from "@sinclair/typebox";

export const Id = Type.Object({
  id: Type.String(),
});
export type Id = Static<typeof Id>;

export const OkResponse = Type.Object({
  ok: Type.Boolean(),
});
export type OkResponse = Static<typeof OkResponse>;

/**
 * Provider Data types
 */

export const OpenBankingData = Type.Object({
  iban: Type.String({ validator: "IBANValidator" }),
  accountHolderName: Type.String(),
});

export const BankTransferData = Type.Object({
  iban: Type.String({ validator: "IBANValidator" }),
  accountHolderName: Type.String(),
});

export const StripeData = Type.Object({
  livePublishableKey: Type.String(),
  liveSecretKey: Type.String(),
});

export const WorldpayData = Type.Object({
  merchantCode: Type.String(),
  installationId: Type.String(),
});

export const RealexData = Type.Object({
  merchantId: Type.String(),
  sharedSecret: Type.String(),
});

export const ProviderData = Type.Union([
  OpenBankingData,
  BankTransferData,
  StripeData,
  WorldpayData,
  RealexData,
]);

/**
 * Providers types
 */

export const ProviderTypes = Type.Union([
  Type.Literal("banktransfer"),
  Type.Literal("openbanking"),
  Type.Literal("stripe"),
  Type.Literal("realex"),
  Type.Literal("worldpay"),
]);

export const ProviderStatus = Type.Union([
  Type.Literal("connected"),
  Type.Literal("disconnected"),
]);

export const Provider = Type.Object({
  id: Type.String(),
  name: Type.String(),
  type: ProviderTypes,
  data: Type.Record(Type.String(), Type.String(), {
    validator: "ProvidersValidator",
  }),
  status: ProviderStatus,
});

export const ProviderReply = Type.Object({
  id: Type.String(),
  name: Type.String(),
  type: ProviderTypes,
  data: ProviderData,
  status: ProviderStatus,
});

export const CreateProvider = Type.Omit(Provider, ["id", "status"]);
export const ProvidersList = Type.Array(ProviderReply);
export const UpdateProvider = Type.Omit(Provider, ["id"]);
export const ParamsWithProviderId = Type.Object({
  providerId: Type.String(),
});

/**
 * Payment requests types
 */

export const ProviderDetails = Type.Object({
  userId: Type.String(),
  id: Type.String(),
  name: Type.String(),
  type: ProviderTypes,
  status: ProviderStatus,
  data: ProviderData,
  createdAt: Type.String(),
});

export const PaymentRequestStatus = Type.Union([
  Type.Literal("active"),
  Type.Literal("inactive"),
]);

export const PaymentRequest = Type.Object({
  paymentRequestId: Type.String(),
  title: Type.String(),
  description: Type.String(),
  amount: Type.Number(),
  reference: Type.String(),
  providers: Type.Array(ProviderDetails),
  status: PaymentRequestStatus,
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
  status: PaymentRequestStatus,
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

/**
 * Pagination
 */

export const PaginationParams = Type.Object({
  offset: Type.Optional(Type.Number()),
  limit: Type.Optional(Type.Number()),
});
export type PaginationParams = Static<typeof PaginationParams>;

export const PaginationLink = Type.Object({
  href: Type.Optional(Type.String()),
});
export type PaginationLink = Static<typeof PaginationLink>;

export const PaginationLinks = Type.Object({
  self: PaginationLink,
  next: PaginationLink,
  prev: PaginationLink,
  first: PaginationLink,
  last: PaginationLink,
});
export type PaginationLinks = Static<typeof PaginationLinks>;

/**
 * Generics
 */

export const GenericResponse = <T extends TSchema>(T: T) =>
  Type.Object({
    data: T,
    metadata: Type.Object({
      links: Type.Optional(PaginationLinks),
    }),
  });
export type GenericResponse<T> = {
  data: T;
  metadata: {
    links?: PaginationLinks;
  };
};
