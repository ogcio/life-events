import RealexHost from "./RealexHost";
import { getMessages, getTranslations } from "next-intl/server";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { Payments } from "building-blocks-sdk";
import { redirect, RedirectType } from "next/navigation";
import { errorHandler } from "../../../../utils";
import { getPaymentsCitizenContext } from "../../../../../libraries/auth";

async function getPaymentDetails(
  accessToken: string,
  paymentId: string,
  amount?: string,
) {
  const { data: details, error } = await new Payments(
    accessToken,
  ).getPaymentRequestPublicInfo(paymentId);

  if (error) {
    errorHandler(error);
  }

  if (!details || details?.status === "inactive") return undefined;

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

async function generatePaymentIntentId(accessToken: string): Promise<string> {
  const { data: result, error } = await new Payments(
    accessToken,
  ).generatePaymentIntentId();

  if (error) {
    errorHandler(error);
  }

  if (!result?.data.intentId) {
    // Handle edge case when intentId was not possible to generate
    console.error("Payment intentId was not possible to generate.");
    redirect("error", RedirectType.replace);
  }

  return result.data.intentId;
}

export default async function CardWithRealex(props: {
  params: { locale: string };
  searchParams:
    | {
        paymentId: string;
        integrationRef: string;
        amount?: string;
      }
    | undefined;
}) {
  const { accessToken, user, isPublicServant } =
    await getPaymentsCitizenContext();

  if (isPublicServant || !accessToken) {
    return redirect("/not-found", RedirectType.replace);
  }

  const messages = await getMessages({ locale: props.params.locale });
  const realexMessages =
    (await messages.PayRealex) as unknown as AbstractIntlMessages;

  const t = await getTranslations("Common");
  if (!props.searchParams?.paymentId) {
    return redirect("/not-found", RedirectType.replace);
  }

  const paymentDetails = await getPaymentDetails(
    accessToken,
    props.searchParams.paymentId,
    props.searchParams.amount,
  );

  if (!paymentDetails) return redirect("/not-found", RedirectType.replace);

  const responseUrl = new URL(
    "/api/v1/realex/verifyPaymentResponse",
    process.env.BACKEND_URL,
  ).toString();

  const intentId = await generatePaymentIntentId(accessToken);
  const { amount, providerId } = paymentDetails;

  const { error: createTransactionError } = await new Payments(
    accessToken,
  ).createTransaction({
    paymentRequestId: props.searchParams.paymentId,
    extPaymentId: intentId,
    integrationReference: props.searchParams.integrationRef,
    amount,
    paymentProviderId: providerId,
    userData: { email: user?.email ?? "", name: user?.name ?? "" },
  });

  if (createTransactionError) {
    errorHandler(createTransactionError);
  }

  const { data: payment, error: realexPaymentObjectError } = await new Payments(
    accessToken,
  ).getRealexPaymentObject({
    intentId,
    amount: amount.toString(),
    providerId,
  });

  if (realexPaymentObjectError) {
    errorHandler(realexPaymentObjectError);
  }

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
          payment={payment}
          responseUrl={responseUrl}
          locale={props.params.locale}
        />
      </NextIntlClientProvider>
    </div>
  );
}
