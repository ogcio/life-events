import { Static, TSchema, Type } from "@sinclair/typebox";
import {
  PAGINATION_LIMIT_DEFAULT,
  PAGINATION_OFFSET_DEFAULT,
} from "../../utils/pagination";

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
  iban: Type.String(),
  accountHolderName: Type.String(),
});

export const BankTransferData = Type.Object({
  iban: Type.String(),
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
  name: Type.String({ validator: "RequiredValidator" }),
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

export const PaymentRequestDetails = Type.Composite([
  PaymentRequest,
  Type.Object({
    redirectUrl: Type.String(),
    allowAmountOverride: Type.Boolean(),
    allowCustomAmount: Type.Boolean(),
  }),
]);

export const CreatePaymentRequest = Type.Object({
  title: Type.String({ validator: "RequiredValidator" }),
  description: Type.String(),
  reference: Type.String({ validator: "RequiredValidator" }),
  amount: Type.Number({ minimum: 1, maximum: 1000000 }),
  redirectUrl: Type.String({ validator: "RequiredValidator" }),
  allowAmountOverride: Type.Boolean(),
  allowCustomAmount: Type.Boolean(),
  providers: Type.Array(Type.String()),
  status: Type.Union([PaymentRequestStatus], {
    validator: "PaymentRequestStatusValidator",
  }),
});

export const EditPaymentRequest = Type.Composite([
  CreatePaymentRequest,
  Type.Object({
    paymentRequestId: Type.String(),
    providersUpdate: Type.Object({
      toDisable: Type.Array(Type.String()),
      toCreate: Type.Array(Type.String()),
    }),
  }),
]);

export const ParamsWithPaymentRequestId = Type.Object({
  requestId: Type.String(),
});

/**
 * Transaction status
 */
export const TransactionStatuses = Type.Union([
  Type.Literal("initiated"),
  Type.Literal("pending"),
  Type.Literal("succeeded"),
  Type.Literal("cancelled"),
  Type.Literal("failed"),
]);

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

export const Transaction = Type.Composite([
  Type.Pick(FullTransaction, [
    "transactionId",
    "status",
    "amount",
    "extPaymentId",
    "updatedAt",
  ]),
  Type.Object({
    title: Type.String(),
  }),
]);

export const TransactionDetails = Type.Composite([
  Transaction,
  Type.Pick(FullTransaction, ["extPaymentId", "userId", "userData"]),
  Type.Object({
    providerName: Type.String(),
    providerType: Type.String(),
    paymentRequestId: Type.String(),
  }),
]);

export const Transactions = Type.Array(TransactionDetails);
export type Transactions = Static<typeof Transactions>;

export const UpdateTransactionBody = Type.Pick(Transaction, ["status"]);

export const CreateTransactionBody = Type.Omit(FullTransaction, [
  "transactionId",
  "status",
  "createdAt",
  "updatedAt",
  "userId",
]);

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

/**
 * Citizen
 */

export const CitizenTransaction = Type.Pick(Transaction, [
  "transactionId",
  "status",
  "title",
  "updatedAt",
  "extPaymentId",
  "amount",
]);
export const CitizenTransactions = Type.Array(CitizenTransaction);

/**
 * Pagination
 */
export const PaginationParams = Type.Object({
  offset: Type.Optional(
    Type.Number({
      default: PAGINATION_OFFSET_DEFAULT,
      minimum: 0,
    }),
  ),
  limit: Type.Optional(
    Type.Number({
      default: PAGINATION_LIMIT_DEFAULT,
      minimum: 5,
      maximum: 50,
      multipleOf: 5,
    }),
  ),
});

export const PaginationLink = Type.Object({
  href: Type.Optional(Type.String()),
});

export const PaginationLinks = Type.Object({
  self: PaginationLink,
  next: Type.Optional(PaginationLink),
  prev: Type.Optional(PaginationLink),
  first: PaginationLink,
  last: PaginationLink,
  pages: Type.Record(Type.String(), PaginationLink),
});

/**
 * Generics
 */

export const GenericResponse = <T extends TSchema>(T: T) =>
  Type.Object({
    data: T,
    metadata: Type.Optional(
      Type.Object({
        links: Type.Optional(PaginationLinks),
        totalCount: Type.Optional(Type.Number()),
      }),
    ),
  });

export const AuditLogEvent = Type.Object({
  auditLogId: Type.String(),
  createdAt: Type.String(),
  eventType: Type.String(),
  title: Type.String(),
  userId: Type.Optional(Type.String()),
  organizationId: Type.Optional(Type.String()),
});

export const AuditLogEvents = Type.Array(AuditLogEvent);

export const AuditLogEventDetails = Type.Composite([
  AuditLogEvent,
  Type.Object({
    metadata: Type.Record(Type.String(), Type.Any()),
  }),
]);

export const CreateAuditLog = Type.Pick(AuditLogEventDetails, [
  "eventType",
  "userId",
  "organizationId",
  "metadata",
]);

export const EventTypes = Type.Record(Type.String(), Type.String());

export const AuditLogEventsFiltersQueryString = Type.Composite([
  PaginationParams,
  Type.Object({
    eventType: Type.Optional(Type.String()),
  }),
]);
