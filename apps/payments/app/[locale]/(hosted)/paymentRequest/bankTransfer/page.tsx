import OpenBankingHost from "./OpenBankingHost";
import { createPaymentRequest } from "../../../../integration/trueLayer";
import { getTranslations } from "next-intl/server";
import { getRealAmount } from "../../../../utils";
import buildApiClient from "../../../../../client/index";
import { PgSessions } from "auth/sessions";

async function getPaymentDetails(
  paymentId: string,
  user: { name: string; email: string },
  amount?: number,
  customAmount?: number,
) {
  const details = (
    await buildApiClient().paymentRequests.apiV1RequestsRequestIdSummaryGet(
      paymentId,
    )
  ).data;

  if (!details) return undefined;

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
        name: string;
        email: string;
      }
    | undefined;
}) {
  const t = await getTranslations("Common");
  if (!props.searchParams?.paymentId) {
    return <h1>{t("notFound")}</h1>;
  }

  const amount = props.searchParams.amount
    ? parseFloat(props.searchParams.amount)
    : undefined;

  const customAmount = props.searchParams.customAmount
    ? parseFloat(props.searchParams.customAmount)
    : undefined;

  const userInfo = {
    name: props.searchParams.name,
    email: props.searchParams.email,
  };

  const details = await getPaymentDetails(
    props.searchParams.paymentId,
    userInfo,
    amount,
    customAmount,
  );
  if (!details) return <h1>{t("notFound")}</h1>;

  const { paymentDetails, paymentRequest } = details;

  await buildApiClient().transactions.apiV1TransactionsPost({
    paymentRequestId: props.searchParams.paymentId,
    extPaymentId: paymentRequest.id,
    integrationReference: props.searchParams.integrationRef,
    amount: paymentDetails.amount,
    paymentProviderId: paymentDetails.providerId,
    userData: userInfo,
  });

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
