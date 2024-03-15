const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function createPaymentIntent(paymentRequest) {
  return await stripe.paymentIntents.create({
    amount: paymentRequest.amount,
    currency: "GBP",
  });
}

export async function getPaymentIntent(clientSecret) {
  return await stripe.paymentIntents.retrieve(clientSecret);
}
