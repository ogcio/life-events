import s from "stripe";
import { TransactionStatuses } from "../../types/TransactionStatuses";
import { PaymentRequest } from "../../types/common";
import buildApiClient from "../../client/index";
import { PgSessions } from "auth/sessions";

const getStripeProviderId = (paymentRequest: PaymentRequest) =>
  paymentRequest.providers.find((p) => p.type === "stripe")!.id;

const getSecretKey = async (
  providerId: string,
  userId: string,
): Promise<string> => {
  const provider = (
    await buildApiClient(userId).providers.apiV1ProvidersProviderIdGet(
      providerId,
    )
  ).data;
  return provider.data.liveSecretKey;
};

const getStripeInstance = async (providerId: string) => {
  try {
    const { userId } = await PgSessions.get();
    const sk = await getSecretKey(providerId, userId);
    return new s(sk);
  } catch (error) {
    // for now, just fallback to our own credentials
  } finally {
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET_KEY) throw new Error("Stripe secret key not found");
    return new s(STRIPE_SECRET_KEY);
  }
};

export async function createPaymentIntent(paymentRequest: PaymentRequest) {
  const providerId = getStripeProviderId(paymentRequest);
  const stripe = await getStripeInstance(providerId);
  return await stripe.paymentIntents.create({
    amount: paymentRequest.amount,
    currency: "EUR",
  });
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
