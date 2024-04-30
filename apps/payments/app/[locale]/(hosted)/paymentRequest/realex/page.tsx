import RealexHost from "./RealexHost";
import { getMessages, getTranslations } from "next-intl/server";
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

  if (!details) return undefined;

  const provider = details.providers.find(
    (provider) => provider.type === "realex",
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

async function generatePaymentIntentId(userId: string): Promise<string> {
  let result;

  try {
    result = await new Payments(userId).generatePaymentIntentId();
  } catch (err) {
    console.log(err);
  }

  if (!result.data.intentId || result.error) {
    // Handle edge case when intentId was not possible to generate
    throw new Error("Payment intentId was not possible to generate.");
  }

  return result.data.intentId;
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
  const realexMessages =
    (await messages.PayRealex) as unknown as AbstractIntlMessages;

  const t = await getTranslations("Common");
  if (!props.searchParams?.paymentId) {
    return <h1>{t("notFound")}</h1>;
  }

  const paymentDetails = await getPaymentDetails(
    userId,
    props.searchParams.paymentId,
    props.searchParams.amount,
  );

  if (!paymentDetails) notFound();

  const responseUrl = new URL(
    `/api/paymentRequest/realex`,
    process.env.HOST_URL,
  ).toString();

  const intentId = await generatePaymentIntentId(userId);
  const providerId = paymentDetails.providers.find(
    (p) => p.type === "realex",
  ).id;
  const { amount } = paymentDetails;

  await new Payments(userId).createTransaction({
    paymentRequestId: props.searchParams.paymentId,
    extPaymentId: intentId,
    integrationReference: props.searchParams.integrationRef,
    amount,
    paymentProviderId: providerId,
    userData: { email, name: `${firstName} ${lastName}` },
  });

  const payment = await new Payments(userId).getRealexPaymentObject({
    intentId,
    amount,
    providerId,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "2em",
      }}
    >
      <NextIntlClientProvider messages={realexMessages}>
        <RealexHost
          payment={payment.data}
          responseUrl={responseUrl}
          locale={props.params.locale}
        />
      </NextIntlClientProvider>
    </div>
  );
}
