import { getTranslations } from "next-intl/server";
import { formatCurrency } from "../../../../../utils";
import { pgpool } from "../../../../../dbConnection";
import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import buildApiClient from "../../../../../../client/index";
import { PgSessions } from "auth/sessions";

type TransactionDetails = {
  transactionId: string;
  status: string;
  title: string;
  amount: number;
  updatedAt: string;
  providerName: string;
  providerType: string;
  extPaymentId: string;
  userData: {
    name: string;
    email: string;
  };
};

async function getTransactionDetails(
  transactionId: string,
): Promise<TransactionDetails> {
  const { userId } = await PgSessions.get();

  const detauils = (
    await buildApiClient(userId).transactions.apiV1TransactionsTransactionIdGet(
      transactionId,
    )
  ).data;

  return detauils;
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
            {dayjs(details.updatedAt).format("DD/MM/YYYY")}
          </dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("status")}</dt>
          <dt className="govie-summary-list__value">{details.status}</dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("providerName")}</dt>
          <dt className="govie-summary-list__value">{details.providerName}</dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("providerType")}</dt>
          <dt className="govie-summary-list__value">{details.providerType}</dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("referenceCode")}</dt>
          <dt className="govie-summary-list__value">{details.extPaymentId}</dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("payerName")}</dt>
          <dt className="govie-summary-list__value">{details.userData.name}</dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("payerEmail")}</dt>
          <dt className="govie-summary-list__value">
            {details.userData.email}
          </dt>
        </div>
      </dl>

      {details.providerType && details.status === "confirmed" && (
        <form action={confirm}>
          <button className="govie-button govie-button--primary">
            {tRequest("transactionFound")}
          </button>
        </form>
      )}
    </div>
  );
}
