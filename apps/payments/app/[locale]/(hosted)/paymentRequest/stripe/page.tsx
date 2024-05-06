import StripeHost from "./StripeHost";
import { getMessages, getTranslations } from "next-intl/server";
import { createPaymentIntent } from "../../../../integration/stripe";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { PgSessions } from "auth/sessions";
import { notFound } from "next/navigation";
import { Payments } from "building-blocks-sdk";

async function getPaymentDetails(
  userId: string,
  paymentId: string,
  amount?: string,
) {
  let details;
  try {
    details = (
      await new Payments(userId).getPaymentRequestPublicInfo(paymentId)
    ).data;
  } catch (err) {
    console.log(err);
  }

  if (!details || details?.status === "inactive") return undefined;

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
      }
    | undefined;
}) {
  const { userId, email, firstName, lastName } = await PgSessions.get();
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
    notFound();
  }

  const { paymentIntent, providerKeysValid } =
    await createPaymentIntent(paymentDetails);

  await new Payments(userId).createTransaction({
    paymentRequestId: props.searchParams.paymentId,
    extPaymentId: paymentIntent.id,
    integrationReference: props.searchParams.integrationRef,
    amount: paymentDetails.amount,
    paymentProviderId: paymentDetails.providerId,
    userData: { email, name: `${firstName} ${lastName}` },
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
          clientSecret={paymentIntent.client_secret as string | undefined}
          returnUri={returnUri}
          paymentRequest={paymentDetails}
          providerKeysValid={providerKeysValid}
        />
      </NextIntlClientProvider>
    </div>
  );
}
