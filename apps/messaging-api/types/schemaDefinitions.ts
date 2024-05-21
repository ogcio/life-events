import { Static, Type } from "@sinclair/typebox";

/**
 * Providers types
 */

export const ProviderSchema = Type.Union([
  Type.Object({
    id: Type.String(),
    name: Type.String(),
    type: Type.Union([
      Type.Literal("banktransfer"),
      Type.Literal("openbanking"),
      Type.Literal("stripe"),
    ]),
    data: Type.Any(),
    status: Type.Union([
      Type.Literal("connected"),
      Type.Literal("disconnected"),
    ]),
  }),
]);
export type Provider = Static<typeof ProviderSchema>;

export const CreateProviderSchema = Type.Omit(ProviderSchema, ["id", "status"]);
export type CreateProvider = Static<typeof CreateProviderSchema>;

export const ProvidersListSchema = Type.Union([Type.Array(ProviderSchema)]);
export type ProvidersList = Static<typeof ProvidersListSchema>;

export const UpdateProviderSchema = Type.Omit(ProviderSchema, ["id", "type"]);
export type UpdateProvider = Static<typeof UpdateProviderSchema>;

export const ParamsWithProviderIdSchema = Type.Object({
  providerId: Type.String(),
});
export type ParamsWithProviderId = Static<typeof ParamsWithProviderIdSchema>;

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
  ]),
  status: Type.Union([Type.Literal("connected"), Type.Literal("disconnected")]),
  data: Type.Any(),
  createdAt: Type.String(),
});

export const PaymentRequestSchema = Type.Object({
  paymentRequestId: Type.String(),
  title: Type.String(),
  description: Type.String(),
  amount: Type.Number(),
  reference: Type.String(),
  providers: Type.Array(ProviderDetails),
});
export type PaymentRequest = Static<typeof PaymentRequestSchema>;

export const PaymentRequestDetailsSchema = Type.Composite([
  PaymentRequestSchema,
  Type.Object({
    redirectUrl: Type.String(),
    allowAmountOverride: Type.Boolean(),
    allowCustomAmount: Type.Boolean(),
  }),
]);
export type PaymentRequestDetails = Static<typeof PaymentRequestDetailsSchema>;

export const CreatePaymentRequestSchema = Type.Object({
  title: Type.String(),
  description: Type.String(),
  reference: Type.String(),
  amount: Type.Number(),
  redirectUrl: Type.String(),
  allowAmountOverride: Type.Boolean(),
  allowCustomAmount: Type.Boolean(),
  providers: Type.Array(Type.String()),
});
export type CreatePaymentRequest = Static<typeof CreatePaymentRequestSchema>;

export const EditPaymentRequestSchema = Type.Composite([
  Type.Omit(CreatePaymentRequestSchema, ["providers"]),
  Type.Object({
    paymentRequestId: Type.String(),
    providersUpdate: Type.Object({
      toDisable: Type.Array(Type.String()),
      toCreate: Type.Array(Type.String()),
    }),
  }),
]);
export type EditPaymentRequest = Static<typeof EditPaymentRequestSchema>;

export const ParamsWithPaymentRequestIdSchema = Type.Object({
  requestId: Type.String(),
});
export type ParamsWithPaymentRequestId = Static<
  typeof ParamsWithPaymentRequestIdSchema
>;

/**
 * Transaction status
 */
export const TransactionStatusesSchema = Type.Union([
  Type.Literal("initiated"),
  Type.Literal("pending"),
  Type.Literal("succeeded"),
  Type.Literal("cancelled"),
  Type.Literal("failed"),
]);
export type TransactionStatuses = Static<typeof TransactionStatusesSchema>;

/**
 * Transactions types
 */

export const FullTransactionSchema = Type.Object({
  transactionId: Type.String(),
  paymentRequestId: Type.String(),
  extPaymentId: Type.String(),
  status: Type.String(), // TODO: Change to TransactionStatuses
  integrationReference: Type.String(),
  amount: Type.Number(),
  paymentProviderId: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
  userData: Type.Object({
    name: Type.String(),
    email: Type.String(),
  }),
});
export type FullTransaction = Static<typeof FullTransactionSchema>;

export const TransactionSchema = Type.Composite([
  Type.Pick(FullTransactionSchema, [
    "transactionId",
    "status",
    "amount",
    "updatedAt",
  ]),
  Type.Object({
    title: Type.String(),
  }),
]);
export type Transaction = Static<typeof TransactionSchema>;

export const TransactionDetails = Type.Composite([
  TransactionSchema,
  Type.Pick(FullTransactionSchema, ["extPaymentId", "userData"]),
  Type.Object({
    providerName: Type.String(),
    providerType: Type.String(),
  }),
]);
export type TransactionDetailsSchema = Static<typeof TransactionDetails>;

export const UpdateTransactionBodySchema = Type.Pick(TransactionSchema, [
  "status",
]);
export type UpdateTransactionBody = Static<typeof UpdateTransactionBodySchema>;

export const CreateTransactionBodySchema = Type.Omit(FullTransactionSchema, [
  "transactionId",
  "status",
  "createdAt",
  "updatedAt",
]);
export type CreateTransactionBody = Static<typeof CreateTransactionBodySchema>;

export const ParamsWithTransactionIdSchema = Type.Object({
  transactionId: Type.String(),
});
export type ParamsWithTransactionId = Static<
  typeof ParamsWithTransactionIdSchema
>;
