export const seedPaymentRequests = async (
  pool,
  {
    userId,
    openBankingProviderId,
    manualBankTransferProviderId,
    stripeProviderId,
    realexProviderId,
    description,
    reference,
    amount,
    redirectUrl,
    allowAmountOverride,
    status,
    allowCustomAmount,
  },
) => {
  console.log("Creating payment request with Stripe provider");

  const paymentRequestWithStripeQueryResult = await pool.query(
    `insert into payment_requests (user_id, title, description, reference, amount, redirect_url, status, allow_amount_override, allow_custom_amount)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     returning payment_request_id`,
    [
      userId,
      "Test Payment Request with Stripe provider",
      description,
      reference,
      amount,
      redirectUrl,
      status,
      allowAmountOverride,
      allowCustomAmount,
    ],
  );

  const paymentRequestWithStripeId =
    paymentRequestWithStripeQueryResult.rows[0].payment_request_id;

  await pool.query(
    `insert into payment_requests_providers (provider_id, payment_request_id, enabled)
    values
        ($2, $1, true),
        ($3, $1, true),
        ($4, $1, true)`,
    [
      paymentRequestWithStripeId,
      openBankingProviderId,
      manualBankTransferProviderId,
      stripeProviderId,
    ],
  );

  console.log("Creating payment request with Realex provider");

  const paymentRequestWithRealexQueryResult = await pool.query(
    `insert into payment_requests (user_id, title, description, reference, amount, redirect_url, status, allow_amount_override, allow_custom_amount)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     returning payment_request_id`,
    [
      userId,
      "Test Payment Request with Realex provider",
      description,
      reference,
      amount,
      redirectUrl,
      status,
      allowAmountOverride,
      allowCustomAmount,
    ],
  );

  const paymentRequestWithRealexId =
    paymentRequestWithRealexQueryResult.rows[0].payment_request_id;

  await pool.query(
    `insert into payment_requests_providers (provider_id, payment_request_id, enabled)
    values
        ($2, $1, true),
        ($3, $1, true),
        ($4, $1, true)`,
    [
      paymentRequestWithRealexId,
      openBankingProviderId,
      manualBankTransferProviderId,
      realexProviderId,
    ],
  );
};
