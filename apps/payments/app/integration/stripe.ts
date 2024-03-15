const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function createPaymentIntent(paymentRequest) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: paymentRequest.amount,
    currency: "GBP",
  });

  return paymentIntent.client_secret;
}
