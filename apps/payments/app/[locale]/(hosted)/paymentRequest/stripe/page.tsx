import StripeHost from "./StripeHost";
import { getMessages, getTranslations } from "next-intl/server";
import { createPaymentIntent } from "../../../../integration/stripe";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import buildApiClient from "../../../../../client/index";
import { PgSessions } from "auth/sessions";

async function getPaymentDetails(
  userId: string,
  paymentId: string,
  amount?: string,
) {
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
  const { userId } = await PgSessions.get();
  const messages = await getMessages({ locale: props.params.locale });
  const stripeMessages =
    (await messages.PayStripe) as unknown as AbstractIntlMessages;

  const t = await getTranslations("Common");
  if (!props.searchParams?.paymentId) {
    return <h1>{t("notFound")}</h1>;
  }

  const paymentDetails = await getPaymentDetails(
    userId,
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

  await buildApiClient(userId).transactions.apiV1TransactionsPost({
    paymentRequestId: props.searchParams.paymentId,
    extPaymentId: paymentIntentId,
    integrationReference: props.searchParams.integrationRef,
    amount: paymentDetails.amount,
    paymentProviderId: paymentDetails.providerId,
    userData: userInfo,
  });

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
