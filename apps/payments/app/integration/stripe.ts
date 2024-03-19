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

export async function createCheckoutSession(paymentRequest, returnUri) {
  return await stripe.checkout.sessions.create({
    payment_method_types: ["card", "paypal"],
    line_items: [
      {
        price_data: {
          currency: "EUR",
          unit_amount: paymentRequest.amount,
          product_data: {
            name: "Your Product",
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: returnUri,
    cancel_url: returnUri,
  });
}
