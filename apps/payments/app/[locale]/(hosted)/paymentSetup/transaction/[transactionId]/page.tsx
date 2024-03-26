import { getTranslations } from "next-intl/server";
import { formatCurrency } from "../../../../../utils";
import { pgpool } from "../../../../../dbConnection";
import dayjs from "dayjs";

type TransactionDetails = {
  transaction_id: string;
  status: string;
  title: string;
  amount: number;
  updated_at: string;
  provider_name: string;
  provider_type: string;
};

async function getTransactionDetails(transactionId: string) {
  const res = await pgpool.query<TransactionDetails>(
    `
    SELECT
      t.transaction_id,
      t.status,
      pr.title,
      t.amount,
      t.updated_at,
      pp.provider_name,
      pp.provider_type
    FROM payment_transactions t
    LEFT JOIN payment_requests pr ON pr.payment_request_id = t.payment_request_id
    JOIN payment_providers pp ON t.payment_provider_id = pp.provider_id
    WHERE t.transaction_id = $1
  `,
    [transactionId],
  );
  return res.rows[0];
}

export default async function ({ params: { transactionId } }) {
  const [t, details] = await Promise.all([
    getTranslations("PaymentSetup.Request.details"),
    getTransactionDetails(transactionId),
  ]);

  return (
    <div>
      <h1 className="govie-heading-l">{t("transactionDetails")}</h1>

      <dl className="govie-summary-list">
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("requestTitle")}</dt>
          <dt className="govie-summary-list__value">{details.title}</dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("amount")}</dt>
          <dt className="govie-summary-list__value">
            {formatCurrency(details.amount)}
          </dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("lastUpdate")}</dt>
          <dt className="govie-summary-list__value">
            {dayjs(details.updated_at).format("DD/MM/YYYY")}
          </dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("status")}</dt>
          <dt className="govie-summary-list__value">{details.status}</dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("providerName")}</dt>
          <dt className="govie-summary-list__value">{details.provider_name}</dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("providerType")}</dt>
          <dt className="govie-summary-list__value">{details.provider_type}</dt>
        </div>
      </dl>
    </div>
  );
}
