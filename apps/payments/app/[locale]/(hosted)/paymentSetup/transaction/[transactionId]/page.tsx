import { getTranslations } from "next-intl/server";
import { formatCurrency } from "../../../../../utils";
import { pgpool } from "../../../../../dbConnection";
import dayjs from "dayjs";
import { revalidatePath } from "next/cache";

type TransactionDetails = {
  transaction_id: string;
  status: string;
  title: string;
  amount: number;
  updated_at: string;
  provider_name: string;
  provider_type: string;
  ext_payment_id: string;
  user_data: {
    name: string;
    email: string;
  };
};

async function getTransactionDetails(transactionId: string) {
  const res = await pgpool.query<TransactionDetails>(
    `
    SELECT
      t.transaction_id,
      t.status,
      t.user_data,
      pr.title,
      t.ext_payment_id,
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

async function confirmTransaction(transactionId: string) {
  "use server";
  await pgpool.query(
    `
    UPDATE payment_transactions
    SET status = 'completed'
    WHERE transaction_id = $1
    `,
    [transactionId],
  );

  revalidatePath("/");
}

export default async function ({ params: { transactionId } }) {
  const [t, details, tRequest] = await Promise.all([
    getTranslations("PaymentSetup.Request.details"),
    getTransactionDetails(transactionId),
    getTranslations("PaymentSetup.Request"),
  ]);

  const confirm = confirmTransaction.bind(null, transactionId);

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
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("referenceCode")}</dt>
          <dt className="govie-summary-list__value">
            {details.ext_payment_id}
          </dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("payerName")}</dt>
          <dt className="govie-summary-list__value">
            {details.user_data.name}
          </dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("payerEmail")}</dt>
          <dt className="govie-summary-list__value">
            {details.user_data.email}
          </dt>
        </div>
      </dl>

      {details.provider_type && details.status === "confirmed" && (
        <form action={confirm}>
          <button className="govie-button govie-button--primary">
            {tRequest("transactionFound")}
          </button>
        </form>
      )}
    </div>
  );
}
