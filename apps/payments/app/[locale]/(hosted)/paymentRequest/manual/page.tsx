import { RedirectType, redirect } from "next/navigation";
import { routeDefinitions } from "../../../../routeDefinitions";
import { pgpool } from "../../../../dbConnection";
import { getTranslations } from "next-intl/server";
import { formatCurrency } from "../../../../utils";
import Link from "next/link";

async function getPaymentDetails(paymentId: string) {
  "use server";
  const { rows } = await pgpool.query(
    `
    select
      pr.payment_request_id,
      pr.user_id,
      pr.title,
      pr.description,
      pr.reference,
      pr.amount,
      pp.provider_id,
      pp.provider_name,
      pp.provider_data,
      u.govid_email,
      u.user_name
    from payment_requests pr
    join payment_requests_providers ppr on pr.payment_request_id = ppr.payment_request_id
    join payment_providers pp on ppr.provider_id = pp.provider_id
    join users u on pr.user_id = u.id
    where pr.payment_request_id = $1
      and pp.provider_type = 'banktransfer'
    `,
    [paymentId],
  );

  if (!rows.length) {
    return undefined;
  }

  return rows[0];
}

export default async function Bank(params: {
  searchParams: { paymentId: string } | undefined;
}) {
  if (!params.searchParams?.paymentId) {
    redirect(routeDefinitions.paymentRequest.pay.path(), RedirectType.replace);
  }

  const t = await getTranslations("PayManualBankTransfer");

  const paymentDetails = await getPaymentDetails(params.searchParams.paymentId);

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
