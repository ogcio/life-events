import { pgpool } from "../../../../dbConnection";
import StripeHost from "./StripeHost";
import { getMessages, getTranslations } from "next-intl/server";
import { createPaymentIntent } from "../../../../integration/stripe";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { createTransaction } from "../../paymentSetup/db";

async function getPaymentDetails(paymentId: string, amount?: string) {
  "use server";
  const { rows } = await pgpool.query(
    `
    select
      pr.payment_request_id,
      pr.title,
      pr.description,
      pr.reference,
      pr.amount,
      pp.provider_id,
      pp.provider_name,
      pp.provider_data,
      pr.allow_amount_override
    from payment_requests pr
    JOIN payment_requests_providers ppr ON pr.payment_request_id = ppr.payment_request_id AND ppr.enabled = true
    join payment_providers pp on ppr.provider_id = pp.provider_id
    where pr.payment_request_id = $1
      and pp.provider_type = 'stripe'
    `,
    [paymentId],
  );

  if (!rows.length) return undefined;

  return {
    ...rows[0],
    amount:
      rows[0].allow_amount_override && amount
        ? parseFloat(amount)
        : rows[0].amount,
  };
}

export default async function Card(props: {
  params: { locale: string };
  searchParams:
    | {
        paymentId: string;
        integrationRef: string;
        amount?: string;
        name: string;
        email: string;
      }
    | undefined;
}) {
  const messages = await getMessages({ locale: props.params.locale });
  const stripeMessages =
    (await messages.PayStripe) as unknown as AbstractIntlMessages;

  const t = await getTranslations("Common");
  if (!props.searchParams?.paymentId) {
    return <h1>{t("notFound")}</h1>;
  }

  const paymentDetails = await getPaymentDetails(
    props.searchParams.paymentId,
    props.searchParams.amount,
  );

  const { client_secret, id: paymentIntentId } =
    await createPaymentIntent(paymentDetails);

  const userInfo = {
    name: props.searchParams.name,
    email: props.searchParams.email,
  };
  await createTransaction(
    props.searchParams.paymentId,
    paymentIntentId,
    props.searchParams.integrationRef,
    paymentDetails.amount,
    paymentDetails.provider_id,
    userInfo,
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
        <StripeHost
          clientSecret={client_secret as string | undefined}
          returnUri={returnUri}
        />
      </NextIntlClientProvider>
    </div>
  );
}
