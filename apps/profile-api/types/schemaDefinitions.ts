import { Static, Type } from "@sinclair/typebox";

/**
 * Addresses types
 */
export const Address = Type.Object({
  address_id: Type.String(),
  address_line1: Type.String(),
  address_line2: Type.String(),
  town: Type.String(),
  county: Type.String(),
  eirecode: Type.String(),
  updated_at: Type.String(),
  move_in_date: Type.String(),
  move_out_date: Type.String(),
});

export type Address = Static<typeof Address>;

export const AddressesList = Type.Array(Address);
export type AddressesList = Static<typeof AddressesList>;

export const CreateAddress = Type.Object({
  address_line1: Type.String(),
  address_line2: Type.Optional(Type.String()),
  town: Type.String(),
  county: Type.String(),
  eirecode: Type.String(),
  move_in_date: Type.Optional(Type.String()),
  move_out_date: Type.Optional(Type.String()),
});

export type CreateAddress = Static<typeof CreateAddress>;

export const ParamsWithAddressId = Type.Object({
  addressId: Type.String(),
});
export type ParamsWithAddressId = Static<typeof ParamsWithAddressId>;

export const UpdateAddress = CreateAddress;
export type UpdateAddress = Static<typeof UpdateAddress>;

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
  Type.Pick(FullTransaction, ["extPaymentId", "userData"]),
  Type.Object({
    providerName: Type.String(),
    providerType: Type.String(),
  }),
]);
export type TransactionDetails = Static<typeof TransactionDetails>;

export const UpdateTransactionBody = Type.Pick(Transaction, ["status"]);
export type UpdateTransactionBody = Static<typeof UpdateTransactionBody>;

export const CreateTransactionBody = Type.Omit(FullTransaction, [
  "transactionId",
  "status",
  "createdAt",
  "updatedAt",
]);
export type CreateTransactionBody = Static<typeof CreateTransactionBody>;

export const ParamsWithTransactionId = Type.Object({
  transactionId: Type.String(),
});
export type ParamsWithTransactionId = Static<typeof ParamsWithTransactionId>;
