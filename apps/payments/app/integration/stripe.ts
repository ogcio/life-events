import s from "stripe";
import { TransactionStatuses } from "../../types/TransactionStatuses";
import { PaymentRequest } from "../../types/common";
import { StripeData } from "../[locale]/(hosted)/paymentSetup/providers/types";
import { errorHandler } from "../utils";
import { AuthenticationFactory } from "../../libraries/authentication-factory";

const getStripeProviderId = (paymentRequest: PaymentRequest) =>
  paymentRequest.providers.find((p) => p.type === "stripe")!.id;

const getSecretKey = async (providerId: string): Promise<string> => {
  const paymentsApi = await AuthenticationFactory.getPaymentsClient();
  const { data: provider, error } =
    await paymentsApi.getProviderById(providerId);

  if (error) {
    errorHandler(error);
  }

  const providerData = provider?.data as StripeData;
  return providerData?.liveSecretKey;
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
    const sk = await getSecretKey(providerId);
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
