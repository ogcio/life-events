import OpenBankingHost from "./OpenBankingHost";
import { createPaymentRequest } from "../../../../integration/trueLayer";
import { getTranslations } from "next-intl/server";
import { errorHandler, getRealAmount } from "../../../../utils";
import { redirect, RedirectType } from "next/navigation";
import { AuthenticationFactory } from "../../../../../libraries/authentication-factory";

const MAX_WAIT_FOR_RESULT = "60";

async function getPaymentDetails(
  paymentId: string,
  user: { name: string; email: string },
  amount?: number,
  customAmount?: number,
) {
  const paymentsApi = await AuthenticationFactory.getPaymentsClient();
  const { data: details, error } =
    await paymentsApi.getPaymentRequestPublicInfo(paymentId);

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
  const authContext = AuthenticationFactory.getInstance();
  const { user, isPublicServant } = await authContext.getContext();
  const paymentsApi = await AuthenticationFactory.getPaymentsClient();
  const t = await getTranslations("Common");

  if (isPublicServant || !props.searchParams?.paymentId) {
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
    { email: user?.email ?? "", name: user?.name ?? "" },
    amount,
    customAmount,
  );

  if (!details) {
    return redirect("/not-found", RedirectType.replace);
  }

  const { paymentDetails, paymentRequest } = details;

  const { error } = await paymentsApi.createTransaction({
    paymentRequestId: props.searchParams.paymentId,
    extPaymentId: paymentRequest.id,
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
  );
  return (
    <OpenBankingHost
      resourceToken={paymentRequest.resource_token}
      paymentId={paymentRequest.id}
      returnUri={returnUri.toString()}
      maxWaitForResult={MAX_WAIT_FOR_RESULT}
    />
  );
}
