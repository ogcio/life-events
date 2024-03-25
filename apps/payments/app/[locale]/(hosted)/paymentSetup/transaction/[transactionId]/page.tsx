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
};

export async function getTransactionDetails(transactionId: string) {
  const res = await pgpool.query<TransactionDetails>(
    `
    SELECT
      t.transaction_id,
      t.status,
      pr.title,
      t.amount,
      t.updated_at
    FROM payment_transactions t
    LEFT JOIN payment_requests pr ON pr.payment_request_id = t.payment_request_id
    WHERE t.transaction_id = $1
  `,
    [transactionId],
  );
  return res.rows[0];
}

export default async function ({ params: { transactionId } }) {
  const [t, details] = await Promise.all([
    getTranslations("PaymentSetup.Payments"),
    getTransactionDetails(transactionId),
  ]);

  console.log(details);

  return (
    <div>
      <h1 className="govie-heading-l">Transaction details</h1>

      <dl className="govie-summary-list">
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">Payment Request Title</dt>
          <dt className="govie-summary-list__value">{details.title}</dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">Amount</dt>
          <dt className="govie-summary-list__value">
            {formatCurrency(details.amount)}
          </dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">Last update</dt>
          <dt className="govie-summary-list__value">
            {dayjs(details.updated_at).format("DD/MM/YYYY")}
          </dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">Status</dt>
          <dt className="govie-summary-list__value">{details.status}</dt>
        </div>
      </dl>
    </div>
  );
}
