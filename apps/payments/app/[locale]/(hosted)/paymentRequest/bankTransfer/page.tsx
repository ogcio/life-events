import { PgSessions } from "auth/sessions";

import OpenBankingHost from "./OpenBankingHost";
import { pgpool } from "../../../../dbConnection";
import { createPaymentRequest } from "../../../../integration/trueLayer";
import { getTranslations } from "next-intl/server";

async function getPaymentDetails(paymentId: string) {
  "use server";
  const { rows } = await pgpool.query(
    `
    select
      pr.payment_request_id,
      pr.user_id,
      pr.title,
      pr.description,
      pr.reference,
      pr.amount,
      pp.provider_id,
      pp.provider_name,
      pp.provider_data,
      u.govid_email,
      u.user_name
    from payment_requests pr
    join payment_requests_providers ppr on pr.payment_request_id = ppr.payment_request_id
    join payment_providers pp on ppr.provider_id = pp.provider_id
    join users u on pr.user_id = u.id
    where pr.payment_request_id = $1
      and pp.provider_type = 'openbanking'
    `,
    [paymentId]
  );

  if (!rows.length) {
    return undefined;
  }

  return createPaymentRequest(rows[0]);
}

async function createTransaction(
  paymentId: string,
  userId: string,
  extPaymentId: string,
  tenantReference: string
) {
  "use server";
  await pgpool.query<{ transaction_id: number }>(
    `
    insert into payment_transactions (payment_request_id, user_id, ext_payment_id, integration_reference, status, created_at, updated_at)
    values ($1, $2, $3, $4, 'pending', now(), now());
    `,
    [paymentId, userId, extPaymentId, tenantReference]
  );
}

export default async function Bank(props: {
  params: { locale: string }
  searchParams: { paymentId: string; integrationRef: string } | undefined;
}) {
  const t = await getTranslations('Common')
  if (!props.searchParams?.paymentId) {
    return <h1>{t('notFound')}</h1>;
  }

  const { userId } = await PgSessions.get();

  const paymentDetails = await getPaymentDetails(props.searchParams.paymentId);

  await createTransaction(
    props.searchParams.paymentId,
    userId,
    paymentDetails.id,
    props.searchParams.integrationRef
  );

  const returnUri = new URL(
    `/${props.params.locale}/paymentRequest/complete`,
    process.env.HOST_URL
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
