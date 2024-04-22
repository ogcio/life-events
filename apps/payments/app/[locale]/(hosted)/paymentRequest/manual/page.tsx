import { RedirectType, notFound, redirect } from "next/navigation";
import { routeDefinitions } from "../../../../routeDefinitions";
import { getTranslations } from "next-intl/server";
import { formatCurrency } from "../../../../utils";
import { Payments } from "building-blocks-sdk";
import { PgSessions } from "auth/sessions";
import { TransactionStatuses } from "../../../../../types/TransactionStatuses";

async function getPaymentDetails(
  userId: string,
  paymentId: string,
  amount?: number,
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

  await new Payments(userId).updateTransaction(transactionId, {
    status: TransactionStatuses.Pending,
  });

  redirect(redirectUrl, RedirectType.replace);
}

async function generatePaymentIntentId(userId: string): Promise<string> {
  "use server";

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

export default async function Bank(params: {
  searchParams:
    | {
        paymentId: string;
        integrationRef: string;
        amount?: string;
      }
    | undefined;
}) {
  const { userId, email, firstName, lastName } = await PgSessions.get();
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
    notFound();
  }

  const paymentIntentId = await generatePaymentIntentId(userId);

  const transactionId = (
    await new Payments(userId).createTransaction({
      paymentRequestId: params.searchParams.paymentId,
      extPaymentId: paymentIntentId,
      integrationReference: params.searchParams.integrationRef,
      amount: paymentDetails.amount,
      paymentProviderId: paymentDetails.providerId,
      userId,
      userData: { email, name: `${firstName} ${lastName}` },
    })
  ).data?.transactionId;

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
            <dt className="govie-summary-list__key">{t("summary.iban")}</dt>
            <dt className="govie-summary-list__value">
              {paymentDetails.providerData.iban}
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
