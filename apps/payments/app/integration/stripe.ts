import s from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) throw new Error("Stripe secret key not found");

const stripe = new s(STRIPE_SECRET_KEY);

export async function createPaymentIntent(paymentRequest) {
  return await stripe.paymentIntents.create({
    amount: paymentRequest.amount,
    currency: "GBP",
  });
}

export async function getPaymentIntent(clientSecret) {
  return await stripe.paymentIntents.retrieve(clientSecret);
}
