import { RedirectType, redirect } from "next/navigation";
import { routeDefinitions } from "../../../../routeDefinitions";
import { getTranslations } from "next-intl/server";
import { formatCurrency } from "../../../../utils";
import buildApiClient from "../../../../../client/index";
import { PgSessions } from "auth/sessions";

async function getPaymentDetails(
  userId: string,
  paymentId: string,
  amount?: number,
) {
  const details = (
    await buildApiClient(userId).paymentRequests.apiV1RequestsRequestIdGet(
      paymentId,
    )
  ).data;

  if (!details) return undefined;

  const provider = details.providers.find(
    (provider) => provider.type === "banktransfer",
  );

  if (!provider) return undefined;

  return {
    ...details,
    providerId: provider.id,
    providerName: provider.name,
    providerData: provider.data,
    amount: details.allowAmountOverride && amount ? amount : details.amount,
  };
}

async function confirmPayment(
  userId: string,
  transactionId: string,
  redirectUrl: string,
) {
  "use server";

  await buildApiClient(userId).transactions.apiV1TransactionsTransactionIdPatch(
    transactionId,
    {
      status: "confirmed",
    },
  );

  redirect(redirectUrl, RedirectType.replace);
}

export default async function Bank(params: {
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
  if (!params.searchParams?.paymentId) {
    redirect(routeDefinitions.paymentRequest.pay.path(), RedirectType.replace);
  }

  const t = await getTranslations("PayManualBankTransfer");

  const amount = params.searchParams.amount
    ? parseFloat(params.searchParams.amount)
    : undefined;
  const paymentDetails = await getPaymentDetails(
    userId,
    params.searchParams.paymentId,
    amount,
  );

  if (!paymentDetails) {
    return <h1 className="govie-heading-l">Payment details not found</h1>;
  }

  //TODO: In production, we want to avoid collisions on the DB
  const paymentIntentId = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  const userInfo = {
    name: params.searchParams.name,
    email: params.searchParams.email,
  };

  const transactionId = (
    await buildApiClient(userId).transactions.apiV1TransactionsPost({
      paymentRequestId: params.searchParams.paymentId,
      extPaymentId: paymentIntentId,
      integrationReference: params.searchParams.integrationRef,
      amount: paymentDetails.amount,
      paymentProviderId: paymentDetails.providerId,
      userData: userInfo,
    })
  ).data.transactionId;

  const paymentMade = confirmPayment.bind(
    this,
    userId,
    transactionId,
    paymentDetails.redirectUrl,
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "2em",
      }}
    >
      <section style={{ width: "80%" }}>
        <h1 className="govie-heading-l">{t("title")}</h1>
        <p className="govie-body">{t("description")}</p>
        <dl className="govie-summary-list">
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">{t("summary.title")}</dt>
            <dt className="govie-summary-list__value">
              {paymentDetails.title}
            </dt>
          </div>
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">{t("summary.amount")}</dt>
            <dt className="govie-summary-list__value">
              {formatCurrency(paymentDetails.amount)}
            </dt>
          </div>
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">
              {t("summary.accountHolderName")}
            </dt>
            <dt className="govie-summary-list__value">
              {paymentDetails.providerData.accountHolderName}
            </dt>
          </div>
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">{t("summary.sortCode")}</dt>
            <dt className="govie-summary-list__value">
              {paymentDetails.providerData.sortCode}
            </dt>
          </div>
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">
              {t("summary.accountHolderName")}
            </dt>
            <dt className="govie-summary-list__value">
              {paymentDetails.providerData.accountNumber}
            </dt>
          </div>
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">
              {t("summary.referenceCode")}*
            </dt>
            <dt className="govie-summary-list__value">
              <b>{paymentIntentId}</b>
              <br />
            </dt>
          </div>
        </dl>
        <p className="govie-body">*{t("summary.referenceCodeDescription")}</p>
        <form action={paymentMade}>
          <button className="govie-button govie-button--primary">
            {t("confirmPayment")}
          </button>
        </form>
      </section>
    </div>
  );
}
