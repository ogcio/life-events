import StripeHost from "./StripeHost";
import { getMessages, getTranslations } from "next-intl/server";
import { createPaymentIntent } from "../../../../integration/stripe";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { createTransaction } from "../../paymentSetup/db";
import buildApiClient from "../../../../../client/index";
import { PgSessions } from "auth/sessions";

async function getPaymentDetails(paymentId: string, amount?: string) {
  const { userId } = await PgSessions.get();
  const details = (
    await buildApiClient(userId).paymentRequests.apiV1RequestsRequestIdGet(
      paymentId,
    )
  ).data;

  if (!details) return undefined;

  const provider = details.providers.find(
    (provider) => provider.type === "stripe",
  );

  if (!provider) return undefined;

  return {
    ...details,
    providerId: provider.id,
    providerName: provider.name,
    providerData: provider.data,
    amount:
      details.allowAmountOverride && amount
        ? parseFloat(amount)
        : details.amount,
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

  if (!paymentDetails) {
    return <h1 className="govie-heading-l">Payment details not found</h1>;
  }

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
    paymentDetails.providerId,
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
