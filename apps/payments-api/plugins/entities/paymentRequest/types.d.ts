import { Static } from "@sinclair/typebox";
import {
  CreatePaymentRequest,
  EditPaymentRequest,
  ParamsWithPaymentRequestId,
  PaymentRequest,
  PaymentRequestDetails,
} from "../../../routes/schemas";

export type PaymentRequestDO = Static<typeof PaymentRequest>;
export type PaymentRequestDetailsDO = Static<typeof PaymentRequestDetails>;
export type CreatePaymentRequestDO = Static<typeof CreatePaymentRequest>;
export type EditPaymentRequestDO = Static<typeof EditPaymentRequest>;
export type ParamsWithPaymentRequestIdDO = Static<
  typeof ParamsWithPaymentRequestId
>;
