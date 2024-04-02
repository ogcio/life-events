export const seedPaymentRequest = async (
  pool,
  {
    userId,
    openBankingProviderId,
    manualBankTransferProviderId,
    stripeProviderId,
    title,
    description,
    reference,
    amount,
    redirectUrl,
    allowAmountOverride,
    status,
    allowCustomAmount,
  },
) => {
  console.log("Creating payment request");

  const paymentRequestQueryResult = await pool.query(
    `insert into payment_requests (user_id, title, description, reference, amount, redirect_url, status, allow_amount_override, allow_custom_amount)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     returning payment_request_id`,
    [
      userId,
      title,
      description,
      reference,
      amount,
      redirectUrl,
      status,
      allowAmountOverride,
      allowCustomAmount,
    ],
  );

  const paymentRequestId = paymentRequestQueryResult.rows[0].payment_request_id;

  await Promise.all[
    (pool.query(
      `insert into payment_requests_providers (provider_id, payment_request_id, enabled)
      values ($1, $2 , true)`,
      [openBankingProviderId, paymentRequestId],
    ),
    pool.query(
      `insert into payment_requests_providers (provider_id, payment_request_id, enabled)
      values ($1, $2, true)`,
      [manualBankTransferProviderId, paymentRequestId],
    ),
    pool.query(
      `insert into payment_requests_providers (provider_id, payment_request_id, enabled)
      values ($1, $2, true)`,
      [stripeProviderId, paymentRequestId],
    ))
  ];
};
