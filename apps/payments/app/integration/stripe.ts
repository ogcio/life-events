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

const getStripeInstance = async (sk: string) => new s(sk);

const callCreateIntentApi = async (stripe: s, amount: number) => {
  return stripe.paymentIntents.create({
    amount,
    currency: "EUR",
  });
};

export async function createPaymentIntent(paymentRequest: PaymentRequest) {
  try {
    const providerId = getStripeProviderId(paymentRequest);
    const { userId } = await PgSessions.get();
    const sk = await getSecretKey(providerId, userId);
    const stripe = await getStripeInstance(sk);

    const paymentIntent = await callCreateIntentApi(
      stripe,
      paymentRequest.amount,
    );
    return { paymentIntent, providerKeysValid: true };
  } catch (error) {
    // for now fallback to use our own key
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET_KEY) throw new Error("Stripe secret key not found");
    const stripe = await getStripeInstance(STRIPE_SECRET_KEY);

    const paymentIntent = await callCreateIntentApi(
      stripe,
      paymentRequest.amount,
    );
    return { paymentIntent, providerKeysValid: false };
  }
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
