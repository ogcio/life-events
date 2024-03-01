import Sqids from "sqids";

const sqids = new Sqids({ minLength: 8 });

import { pgpool } from "../../../../dbConnection";
import { getTranslations } from "next-intl/server";
import { formatCurrency } from "../../../../utils";
import Link from "next/link";

type Props = {
  searchParams: {
    payment_id: string;
  } | undefined;
};

async function updateTransaction(tlPaymentId: string) {
  "use server";

  const { rows } = await pgpool.query<{
    transaction_id: number;
    payment_request_id: string;
    updated_at: string;
  }>(
    `
    update payment_transactions
    set status = 'executed', updated_at = now()
    where tl_payment_id = $1
    returning transaction_id, payment_request_id, updated_at
    `,
    [tlPaymentId]
  );

  if (!rows.length) {
    console.error("Transaction not found");
  }

  return rows[0];
}

async function getRequestDetails(requestId: string) {
  "use server"

  const res = await pgpool.query(
    `
    select
      pr.title,
      pr.amount
    from payment_requests pr
    where pr.payment_request_id = $1
    `,
    [requestId]
  );

  return res.rows[0];
}

export default async function Page(props: Props) {
  if (!props.searchParams?.payment_id) {
    return <h1>Payment request not found</h1>;
  }

  const [transactionDetail, t] = await Promise.all([
    updateTransaction(props.searchParams.payment_id),
    getTranslations("PaymentRequestComplete"),
  ]);

  const requestDetails = await getRequestDetails(transactionDetail.payment_request_id)

  const hashedTransactionId = sqids.encode([transactionDetail.transaction_id]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "2em",
      }}
    >
      <section style={{ width:'80%'}}>
        <div
          className="govie-panel govie-panel--confirmation"
        >
          <h1 className="govie-panel__title">{t("title")}</h1>
          <div className="govie-panel__body">
            {t("yourRef")}
            <br />
            <strong>{hashedTransactionId}</strong>
          </div>
        </div>
        <dl className="govie-summary-list">
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">{t("summary.title")}</dt>
            <dt className="govie-summary-list__value">{requestDetails.title}</dt>
          </div>
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">{t("summary.amount")}</dt>
            <dt className="govie-summary-list__value">
              {formatCurrency(requestDetails.amount)}
            </dt>
          </div>
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">{t("summary.date")}</dt>
            <dt className="govie-summary-list__value">
              {new Date(transactionDetail.updated_at).toLocaleDateString()}
            </dt>
          </div>
        </dl>
        <Link href="/">
          <button className="govie-button govie-button--primary">{t("back")}</button>
        </Link>
      </section>
    </div>
  );
}
