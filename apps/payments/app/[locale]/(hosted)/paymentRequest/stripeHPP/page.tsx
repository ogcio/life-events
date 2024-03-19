import { PgSessions, getUserInfoById } from "auth/sessions";
import { pgpool } from "../../../../dbConnection";
import { getTranslations } from "next-intl/server";
import { createCheckoutSession } from "../../../../integration/stripe";
import StripeCheckout from "./StripeCheckout";

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
      pp.provider_data
    from payment_requests pr
    join payment_requests_providers ppr on pr.payment_request_id = ppr.payment_request_id
    join payment_providers pp on ppr.provider_id = pp.provider_id
    where pr.payment_request_id = $1
      and pp.provider_type = 'stripe'
    `,
    [paymentId],
  );

  if (!rows.length) return undefined;

  const userInfo = await getUserInfoById(rows[0].user_id);

  if (!userInfo) return undefined;

  return {
    ...rows[0],
    govid_email: userInfo.govid_email,
    user_name: userInfo.user_name,
  };
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

export default async function Card(props: {
  params: { locale: string };
  searchParams: { paymentId: string; integrationRef: string } | undefined;
}) {
  const t = await getTranslations("Common");
  if (!props.searchParams?.paymentId) {
    return <h1>{t("notFound")}</h1>;
  }
  const { userId } = await PgSessions.get();

  const paymentDetails = await getPaymentDetails(props.searchParams.paymentId);

  const returnUri = new URL(
    `/${props.params.locale}/paymentRequest/complete`,
    process.env.HOST_URL,
  ).toString();

  const session = await createCheckoutSession(paymentDetails, returnUri);

  // TODO: we're storing the checkout session id here as external payment id.
  // should be later used with webhooks to retrieve payment status
  await createTransaction(
    props.searchParams.paymentId,
    userId,
    session.id,
    props.searchParams.integrationRef,
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "2em",
      }}
    >
      <StripeCheckout sessionId={session.id} />
    </div>
  );
}
