import { PgSessions, getUserInfoById } from "auth/sessions";
import { pgpool } from "../../../../dbConnection";
import StripeHost from "./StripeHost";
import { getMessages, getTranslations } from "next-intl/server";
import { createPaymentIntent } from "../../../../integration/stripe";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";

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
  const messages = await getMessages({ locale: props.params.locale });
  const stripeMessages =
    (await messages.PayStripe) as unknown as AbstractIntlMessages;

  const t = await getTranslations("Common");
  if (!props.searchParams?.paymentId) {
    return <h1>{t("notFound")}</h1>;
  }
  const { userId } = await PgSessions.get();

  const paymentDetails = await getPaymentDetails(props.searchParams.paymentId);

  const clientSecret = await createPaymentIntent(paymentDetails);

  await createTransaction(
    props.searchParams.paymentId,
    userId,
    paymentDetails.id,
    props.searchParams.integrationRef,
  );

  const returnUri = new URL(
    `/${props.params.locale}/paymentRequest/complete`,
    process.env.HOST_URL,
  ).toString();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "2em",
      }}
    >
      <NextIntlClientProvider messages={stripeMessages}>
        <StripeHost clientSecret={clientSecret} returnUri={returnUri} />
      </NextIntlClientProvider>
    </div>
  );
}
