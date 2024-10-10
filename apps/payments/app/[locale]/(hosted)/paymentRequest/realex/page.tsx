import RealexHost from "./RealexHost";
import { getMessages, getTranslations } from "next-intl/server";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { redirect, RedirectType } from "next/navigation";
import { errorHandler } from "../../../../utils";
import { AuthenticationFactory } from "../../../../../libraries/authentication-factory";

async function getPaymentDetails(paymentId: string, amount?: string) {
  const paymentsApi = await AuthenticationFactory.getPaymentsClient();
  const { data: details, error } =
    await paymentsApi.getPaymentRequestPublicInfo(paymentId);

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

async function generatePaymentIntentId(): Promise<string> {
  const paymentsApi = await AuthenticationFactory.getPaymentsClient();
  const { data: result, error } = await paymentsApi.generatePaymentIntentId();

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
        submissionId?: string;
        journeyId?: string;
      }
    | undefined;
}) {
  const authContext = AuthenticationFactory.getInstance();
  const { user, isPublicServant } = await authContext.getContext();

  if (isPublicServant) {
    return redirect("/not-found", RedirectType.replace);
  }

  const paymentsApi = await AuthenticationFactory.getPaymentsClient();
  const messages = await getMessages({ locale: props.params.locale });
  const realexMessages =
    (await messages.PayRealex) as unknown as AbstractIntlMessages;

  const t = await getTranslations("Common");
  if (!props.searchParams?.paymentId) {
    return redirect("/not-found", RedirectType.replace);
  }

  const paymentDetails = await getPaymentDetails(
    props.searchParams.paymentId,
    props.searchParams.amount,
  );

  if (!paymentDetails) return redirect("/not-found", RedirectType.replace);

  const responseUrl = new URL(
    "/api/v1/realex/verifyPaymentResponse",
    process.env.BACKEND_URL,
  ).toString();
  const statusUpdateUrl = new URL(
    "/api/v1/realex/statusUpdate",
    process.env.BACKEND_URL,
  ).toString();

  const intentId = await generatePaymentIntentId();
  const { amount, providerId } = paymentDetails;

  const { error: createTransactionError } = await paymentsApi.createTransaction(
    {
      paymentRequestId: props.searchParams.paymentId,
      extPaymentId: intentId,
      integrationReference: props.searchParams.integrationRef,
      amount,
      paymentProviderId: providerId,
      metadata: {
        email: user?.email ?? "",
        name: user?.name ?? "",
        submissionId: props.searchParams.submissionId ?? "",
        journeyId: props.searchParams.journeyId ?? "",
      },
    },
  );

  if (createTransactionError) {
    errorHandler(createTransactionError);
  }

  const { data: payment, error: realexPaymentObjectError } =
    await paymentsApi.getRealexPaymentObject({
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
          statusUpdateUrl={statusUpdateUrl}
          locale={props.params.locale}
        />
      </NextIntlClientProvider>
    </div>
  );
}
