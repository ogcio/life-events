import { PgSessions, getUserInfoById } from "auth/sessions";

import OpenBankingHost from "./OpenBankingHost";
import { pgpool } from "../../../../dbConnection";
import { createPaymentRequest } from "../../../../integration/trueLayer";
import { getTranslations } from "next-intl/server";
import { getRealAmount } from "../../../../utils";

async function getPaymentDetails(
  paymentId: string,
  amount?: number,
  customAmount?: number,
) {
  const { rows: paymentRows } = await pgpool.query(
    `
    SELECT
      pr.payment_request_id,
      pr.user_id,
      pr.title,
      pr.description,
      pr.reference,
      pr.amount,
      pp.provider_id,
      pp.provider_name,
      pp.provider_data,
      pr.allow_amount_override as "allowAmountOverride",
      pr.allow_custom_amount as "allowCustomAmount"
    FROM payment_requests pr
    JOIN payment_requests_providers ppr ON pr.payment_request_id = ppr.payment_request_id AND ppr.enabled = true
    JOIN payment_providers pp ON ppr.provider_id = pp.provider_id
    WHERE pr.payment_request_id = $1
      AND pp.provider_type = 'openbanking'
    `,
    [paymentId],
  );

  if (!paymentRows.length) return undefined;

  const userInfo = await getUserInfoById(paymentRows[0].user_id);

  if (!userInfo) return undefined;

  const realAmount = getRealAmount({
    amount: paymentRows[0].amount,
    customAmount,
    amountOverride: amount,
    allowAmountOverride: paymentRows[0].allowAmountOverride,
    allowCustomOverride: paymentRows[0].allowCustomAmount,
  });

  const paymentDetails = {
    ...paymentRows[0],
    amount: realAmount,
    govid_email: userInfo.govid_email,
    user_name: userInfo.user_name,
  };


  const paymentRequest = await createPaymentRequest(paymentDetails);
  return {
    paymentDetails,
    paymentRequest,
  };
}

async function createTransaction(
  paymentId: string,
  userId: string,
  extPaymentId: string,
  tenantReference: string,
  amount: number,
) {
  "use server";
  await pgpool.query<{ transaction_id: number }>(
    `
    insert into payment_transactions (payment_request_id, user_id, ext_payment_id, integration_reference, amount, status, created_at, updated_at)
    values ($1, $2, $3, $4, $5, 'pending', now(), now());
    `,
    [paymentId, userId, extPaymentId, tenantReference, amount],
  );
}

export default async function Bank(props: {
  params: { locale: string };
  searchParams:
    | {
        paymentId: string;
        integrationRef: string;
        amount?: string;
        customAmount?: string;
      }
    | undefined;
}) {
  const t = await getTranslations("Common");
  if (!props.searchParams?.paymentId) {
    return <h1>{t("notFound")}</h1>;
  }

  const { userId } = await PgSessions.get();

  const amount = props.searchParams.amount
    ? parseFloat(props.searchParams.amount)
    : undefined;

  const customAmount = props.searchParams.customAmount
    ? parseFloat(props.searchParams.customAmount)
    : undefined;

  const details = await getPaymentDetails(
    props.searchParams.paymentId,
    amount,
    customAmount,
  );
  if (!details) return <h1>{t("notFound")}</h1>;

  const { paymentDetails, paymentRequest } = details;

  await createTransaction(
    props.searchParams.paymentId,
    userId,
    paymentRequest.id,
    props.searchParams.integrationRef,
    paymentDetails.amount,
  );

  const returnUri = new URL(
    `/${props.params.locale}/paymentRequest/complete`,
    process.env.HOST_URL,
  );
  return (
    <OpenBankingHost
      resourceToken={paymentRequest.resource_token}
      paymentId={paymentRequest.id}
      returnUri={returnUri.toString()}
    />
  );
}
