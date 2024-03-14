import { RedirectType, redirect } from "next/navigation";
import { routeDefinitions } from "../../../../routeDefinitions";
import { pgpool } from "../../../../dbConnection";
import { getTranslations } from "next-intl/server";
import { formatCurrency } from "../../../../utils";
import Link from "next/link";
import { getUserInfoById } from "auth/sessions";

async function getPaymentDetails(paymentId: string, amount?: number) {
  const { rows: paymentRows } = await pgpool.query(
    `
    SELECT
      pr.payment_request_id,
      pr.user_id,
      pr.title,
      pr.description,
      pr.reference,
      pr.amount,
      pp.provider_id,
      pp.provider_name,
      pp.provider_data,
      pr.allow_amount_override
    FROM payment_requests pr
    JOIN payment_requests_providers ppr ON pr.payment_request_id = ppr.payment_request_id
    JOIN payment_providers pp ON ppr.provider_id = pp.provider_id
    WHERE pr.payment_request_id = $1
      AND pp.provider_type = 'banktransfer'
    `,
    [paymentId],
  );

  if (!paymentRows.length) return undefined;

  const userInfo = await getUserInfoById(paymentRows[0].user_id);

  if (!userInfo) return undefined;

  return {
    ...paymentRows[0],
    amount:
      paymentRows[0].allow_amount_override && amount
        ? amount
        : paymentRows[0].amount,
    govid_email: userInfo.govid_email,
    user_name: userInfo.user_name,
  };
}

export default async function Bank(params: {
  searchParams: { paymentId: string; amount?: string } | undefined;
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
        </dl>
        <Link href="/">
          <button className="govie-button govie-button--primary">
            {t("back")}
          </button>
        </Link>
      </section>
    </div>
  );
}
