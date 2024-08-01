import StripeHost from "./StripeHost";
import { getMessages, getTranslations } from "next-intl/server";
import { createPaymentIntent } from "../../../../integration/stripe";
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
  const authContext = AuthenticationFactory.getInstance();
  const { user, isPublicServant } = await authContext.getContext();

  if (isPublicServant) {
    return redirect("/not-found", RedirectType.replace);
  }

  const paymentsApi = await AuthenticationFactory.getPaymentsClient();
  const messages = await getMessages({ locale: props.params.locale });
  const stripeMessages =
    (await messages.PayStripe) as unknown as AbstractIntlMessages;

  const t = await getTranslations("Common");
  if (!props.searchParams?.paymentId) {
    return redirect("/not-found", RedirectType.replace);
  }

  const paymentDetails = await getPaymentDetails(
    props.searchParams.paymentId,
    props.searchParams.amount,
  );

  if (!paymentDetails) {
    return redirect("/not-found", RedirectType.replace);
  }

  const { paymentIntent, providerKeysValid } =
    await createPaymentIntent(paymentDetails);

  const { error } = await paymentsApi.createTransaction({
    paymentRequestId: props.searchParams.paymentId,
    extPaymentId: paymentIntent.id,
    integrationReference: props.searchParams.integrationRef,
    amount: paymentDetails.amount,
    paymentProviderId: paymentDetails.providerId,
    userData: { email: user?.email ?? "", name: user?.name ?? "" },
  });

  if (error) {
    errorHandler(error);
  }

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
