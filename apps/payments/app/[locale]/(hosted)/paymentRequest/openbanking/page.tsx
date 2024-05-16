import OpenBankingHost from "./OpenBankingHost";
import { createPaymentRequest } from "../../../../integration/trueLayer";
import { getTranslations } from "next-intl/server";
import { errorHandler, getRealAmount } from "../../../../utils";
import { PgSessions } from "auth/sessions";
import { redirect, RedirectType } from "next/navigation";
import { Payments } from "building-blocks-sdk";

async function getPaymentDetails(
  paymentId: string,
  userId: string,
  user: { name: string; email: string },
  amount?: number,
  customAmount?: number,
) {
  const { data: details, error } = await new Payments(
    userId,
  ).getPaymentRequestPublicInfo(paymentId);

  if (error) {
    errorHandler(error);
  }

  if (!details || details?.status === "inactive") return undefined;

  const provider = details.providers.find(
    (provider) => provider.type === "openbanking",
  );

  if (!provider) return undefined;

  const realAmount = getRealAmount({
    amount: details.amount,
    customAmount,
    amountOverride: amount,
    allowAmountOverride: details.allowAmountOverride,
    allowCustomOverride: details.allowCustomAmount,
  });

  const paymentDetails = {
    ...details,
    providerId: provider.id,
    providerName: provider.name,
    providerData: provider.data,
    amount: realAmount,
    user,
  };

  const paymentRequest = await createPaymentRequest(paymentDetails);
  return {
    paymentDetails,
    paymentRequest,
  };
}

export default async function Bank(props: {
  params: { locale: string };
  searchParams:
    | {
        paymentId: string;
        integrationRef: string;
        amount?: string;
        customAmount?: string;
      }
    | undefined;
}) {
  const { userId, firstName, lastName, email, publicServant } =
    await PgSessions.get();
  const t = await getTranslations("Common");

  if (publicServant || !props.searchParams?.paymentId) {
    return redirect("/not-found", RedirectType.replace);
  }

  const amount = props.searchParams.amount
    ? parseFloat(props.searchParams.amount)
    : undefined;

  const customAmount = props.searchParams.customAmount
    ? parseFloat(props.searchParams.customAmount)
    : undefined;

  const details = await getPaymentDetails(
    props.searchParams.paymentId,
    userId,
    { email, name: `${firstName} ${lastName}` },
    amount,
    customAmount,
  );

  if (!details) {
    return redirect("/not-found", RedirectType.replace);
  }

  const { paymentDetails, paymentRequest } = details;

  const { error } = await new Payments(userId).createTransaction({
    paymentRequestId: props.searchParams.paymentId,
    extPaymentId: paymentRequest.id,
    integrationReference: props.searchParams.integrationRef,
    amount: paymentDetails.amount,
    paymentProviderId: paymentDetails.providerId,
    userData: { email, name: `${firstName} ${lastName}` },
  });

  if (error) {
    errorHandler(error);
  }

  const returnUri = new URL(
    `/${props.params.locale}/paymentRequest/complete`,
    process.env.HOST_URL,
  );
  return (
    <OpenBankingHost
      resourceToken={paymentRequest.resource_token}
      paymentId={paymentRequest.id}
      returnUri={returnUri.toString()}
    />
  );
}
