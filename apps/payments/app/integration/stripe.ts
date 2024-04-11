import s from "stripe";
import { TransactionStatuses } from "../../types/TransactionStatuses";

const getStripeInstance = () => {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_SECRET_KEY) throw new Error("Stripe secret key not found");

  return new s(STRIPE_SECRET_KEY);
};

export async function createPaymentIntent(paymentRequest) {
  return await getStripeInstance().paymentIntents.create({
    amount: paymentRequest.amount,
    currency: "EUR",
  });
}

export async function getPaymentIntent(clientSecret) {
  return await getStripeInstance().paymentIntents.retrieve(clientSecret);
}

export function getInternalStatus(status: string) {
  switch (status) {
    case "processing":
      return TransactionStatuses.Pending;
    case "succeeded":
      return TransactionStatuses.Succeeded;
    case "payment_failed":
      return TransactionStatuses.Failed;
  }
}
