import Stripe from "stripe";
import { TransactionStatusesEnum } from "../../plugins/entities/transactions";

export enum StripeEventTypes {
  CREATED = "payment_intent.created",
  AMOUNT_CAPTURABLE = "payment_intent.amount_capturable_updated",
  PARTIALLY_FUNDED = "payment_intent.partially_funded",
  REQUIRES_ACTION = "payment_intent.requires_action",
  SUCCEEDED = "payment_intent.succeeded",
  CANCELED = "payment_intent.canceled",
  FAILED = "payment_intent.payment_failed",
}

export const getTransactionStatusFromStripeEventType = (
  event: Stripe.Event,
): TransactionStatusesEnum | undefined => {
  switch (event.type) {
    case StripeEventTypes.CREATED:
      return TransactionStatusesEnum.Initiated;
    case StripeEventTypes.AMOUNT_CAPTURABLE:
    case StripeEventTypes.PARTIALLY_FUNDED:
    case StripeEventTypes.REQUIRES_ACTION:
      return TransactionStatusesEnum.Pending;
    case StripeEventTypes.SUCCEEDED:
      return TransactionStatusesEnum.Succeeded;
    case StripeEventTypes.CANCELED:
      return TransactionStatusesEnum.Cancelled;
    case StripeEventTypes.FAILED:
      return TransactionStatusesEnum.Failed;
    default:
      return undefined;
  }
};

export const removeEmptyProps = (obj: Record<string, any>): any => {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([_, v]) => v != null)
      .map(([k, v]) => [k, v === Object(v) ? removeEmptyProps(v) : v]),
  );
};
