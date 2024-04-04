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
        sortCode: "123456",
        accountNumber: "12345678",
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
        sortCode: "123456",
        accountNumber: "12345678",
        accountHolderName: "Lorem Ipsum",
      }),
    ],
  );

  const stripe = pool.query(
    `INSERT INTO payment_providers(user_id, provider_name, provider_type, status, provider_data) 
     VALUES($1, $2, $3, $4, $5) returning provider_id`,
    [
      userId,
      "Stripe provider",
      "stripe",
      "connected",
      JSON.stringify({
        livePublishableKey: "foo",
        liveSecretKey: "bar",
      }),
    ],
  );

  const worldpay = pool.query(
    `INSERT INTO payment_providers(user_id, provider_name, provider_type, status, provider_data) 
     VALUES($1, $2, $3, $4, $5)`,
    [
      userId,
      "Worldpay provider",
      "worldpay",
      "connected",
      JSON.stringify({
        merchantCode: "foo",
        installationId: "foo",
      }),
    ],
  );

  // TODO: add worldpay
  return Promise.all([manualBankTransfer, openBanking, stripe]);
};
