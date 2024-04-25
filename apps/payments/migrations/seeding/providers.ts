import { Payments } from "building-blocks-sdk";

export const seedProviders = (pool, userId) => {
  console.log("Seeding providers");

  const manualBankTransfer = pool.query(
    `INSERT INTO payment_providers(user_id, provider_name, provider_type, status, provider_data) 
     VALUES($1, $2, $3, $4, $5) returning provider_id`,
    [
      userId,
      "Manual Bank Transfer",
      "banktransfer",
      "connected",
      JSON.stringify({
        iban: "IE29AIBK93115212345678",
        accountHolderName: "Lorem Ipsum",
      }),
    ],
  );

  const openBanking = pool.query(
    `INSERT INTO payment_providers(user_id, provider_name, provider_type, status, provider_data) 
     VALUES($1, $2, $3, $4, $5) returning provider_id`,
    [
      userId,
      "Open Banking provider",
      "openbanking",
      "connected",
      JSON.stringify({
        iban: "IE29AIBK93115212345678",
        accountHolderName: "Lorem Ipsum",
      }),
    ],
  );

  const stripe = new Payments(userId).createStripeProvider({
    name: "Stripe provider",
    type: "stripe",
    data: {
      liveSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
      livePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
    },
  });

  const realex = new Payments(userId).createRealexProvider({
    name: "Realex provider",
    type: "realex",
    data: {
      merchantId: process.env.REALEX_MERCHANT_ID ?? "",
      sharedSecret: process.env.REALEX_SHARED_SECRET ?? "",
    },
  });

  // TODO: add worldpay with merchantCode and installationId
  return Promise.all([manualBankTransfer, openBanking, stripe, realex]);
};
