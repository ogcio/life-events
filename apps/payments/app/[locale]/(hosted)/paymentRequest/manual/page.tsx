import { RedirectType, redirect } from "next/navigation";
import { routeDefinitions } from "../../../../routeDefinitions";
import { pgpool } from "../../../../dbConnection";
import { getTranslations } from "next-intl/server";
import { formatCurrency } from "../../../../utils";
import Link from "next/link";
import { createTransaction } from "../../paymentSetup/db";

async function getPaymentDetails(paymentId: string, amount?: number) {
  const { rows: paymentRows } = await pgpool.query(
    `
    SELECT
      pr.payment_request_id,
      pr.title,
      pr.description,
      pr.reference,
      pr.amount,
      pr.redirect_url,
      pp.provider_id,
      pp.provider_name,
      pp.provider_data,
      pr.allow_amount_override
    FROM payment_requests pr
    JOIN payment_requests_providers ppr ON pr.payment_request_id = ppr.payment_request_id AND ppr.enabled = true
    JOIN payment_providers pp ON ppr.provider_id = pp.provider_id
    WHERE pr.payment_request_id = $1
      AND pp.provider_type = 'banktransfer'
    `,
    [paymentId],
  );

  if (!paymentRows.length) return undefined;

  return {
    ...paymentRows[0],
    amount:
      paymentRows[0].allow_amount_override && amount
        ? amount
        : paymentRows[0].amount,
  };
}

async function confirmPayment(transactionId: string, redirectUrl: string) {
  "use server";
  await pgpool.query(
    `
    UPDATE payment_transactions
    SET status = 'confirmed'
    WHERE transaction_id = $1
    `,
    [transactionId],
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
  if (!params.searchParams?.paymentId) {
    redirect(routeDefinitions.paymentRequest.pay.path(), RedirectType.replace);
  }

  const t = await getTranslations("PayManualBankTransfer");

  const amount = params.searchParams.amount
    ? parseFloat(params.searchParams.amount)
    : undefined;
  const paymentDetails = await getPaymentDetails(
    params.searchParams.paymentId,
    amount,
  );

  //TODO: In production, we want to avoid collisions on the DB
  const paymentIntentId = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  const userInfo = {
    name: params.searchParams.name,
    email: params.searchParams.email,
  };

  const transactionId = await createTransaction(
    params.searchParams.paymentId,
    paymentIntentId,
    params.searchParams.integrationRef,
    paymentDetails.amount,
    paymentDetails.provider_id,
    userInfo,
  );

  const paymentMade = confirmPayment.bind(
    this,
    transactionId,
    paymentDetails.redirect_url,
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
              {paymentDetails.provider_data.accountHolderName}
            </dt>
          </div>
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">{t("summary.sortCode")}</dt>
            <dt className="govie-summary-list__value">
              {paymentDetails.provider_data.sortCode}
            </dt>
          </div>
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">
              {t("summary.accountHolderName")}
            </dt>
            <dt className="govie-summary-list__value">
              {paymentDetails.provider_data.accountNumber}
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
