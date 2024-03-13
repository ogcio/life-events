import { PgSessions, getUserInfoById } from "auth/sessions";

import OpenBankingHost from "./OpenBankingHost";
import { pgpool } from "../../../../dbConnection";
import { createPaymentRequest } from "../../../../integration/trueLayer";
import { getTranslations } from "next-intl/server";

async function getPaymentDetails(paymentId: string) {
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
      pp.provider_data
    FROM payment_requests pr
    JOIN payment_requests_providers ppr ON pr.payment_request_id = ppr.payment_request_id
    JOIN payment_providers pp ON ppr.provider_id = pp.provider_id
    WHERE pr.payment_request_id = $1
      AND pp.provider_type = 'openbanking'
    `,
    [paymentId],
  );

  if (!paymentRows.length) return undefined;

  const userInfo = await getUserInfoById(paymentRows[0].user_id);

  if (!userInfo) return undefined;

  // Merge the payment details with user details
  const paymentDetails = {
    ...paymentRows[0],
    govid_email: userInfo.govid_email,
    user_name: userInfo.user_name,
  };

  return createPaymentRequest(paymentDetails);
}

async function createTransaction(
  paymentId: string,
  userId: string,
  extPaymentId: string,
  tenantReference: string,
) {
  "use server";
  await pgpool.query<{ transaction_id: number }>(
    `
    insert into payment_transactions (payment_request_id, user_id, ext_payment_id, integration_reference, status, created_at, updated_at)
    values ($1, $2, $3, $4, 'pending', now(), now());
    `,
    [paymentId, userId, extPaymentId, tenantReference],
  );
}

export default async function Bank(props: {
  params: { locale: string };
  searchParams: { paymentId: string; integrationRef: string } | undefined;
}) {
  const t = await getTranslations("Common");
  if (!props.searchParams?.paymentId) {
    return <h1>{t("notFound")}</h1>;
  }

  const { userId } = await PgSessions.get();

  const paymentDetails = await getPaymentDetails(props.searchParams.paymentId);

  await createTransaction(
    props.searchParams.paymentId,
    userId,
    paymentDetails.id,
    props.searchParams.integrationRef,
  );

  const returnUri = new URL(
    `/${props.params.locale}/paymentRequest/complete`,
    process.env.HOST_URL,
  );
  return (
    <div
      style={{
        display: "flex",
        marginTop: "1.3rem",
        gap: "2rem",
        alignItems: "center",
      }}
    >
      <OpenBankingHost
        resourceToken={paymentDetails.resource_token}
        paymentId={paymentDetails.id}
        returnUri={returnUri.toString()}
      />
    </div>
  );
}
