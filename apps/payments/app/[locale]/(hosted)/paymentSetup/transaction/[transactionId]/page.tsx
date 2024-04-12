import { getTranslations } from "next-intl/server";
import { formatCurrency } from "../../../../../utils";
import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import buildApiClient from "../../../../../../client/index";
import { PgSessions } from "auth/sessions";
import { notFound } from "next/navigation";

async function getTransactionDetails(transactionId: string) {
  const { userId } = await PgSessions.get();
  let details;

  try {
    details = (
      await buildApiClient(
        userId,
      ).transactions.apiV1TransactionsTransactionIdGet(transactionId)
    ).data;
  } catch (err) {
    console.log(err);
  }

  return details;
}

async function confirmTransaction(transactionId: string) {
  "use server";

  const { userId } = await PgSessions.get();
  await buildApiClient(userId).transactions.apiV1TransactionsTransactionIdPatch(
    transactionId,
    {
      status: "completed",
    },
  );

  revalidatePath("/");
}

export default async function ({ params: { transactionId } }) {
  const [t, details, tRequest] = await Promise.all([
    getTranslations("PaymentSetup.Request.details"),
    getTransactionDetails(transactionId),
    getTranslations("PaymentSetup.Request"),
  ]);

  if (!details) {
    notFound();
  }

  const confirm = confirmTransaction.bind(null, transactionId);

  return (
    <div>
      <h1 className="govie-heading-l">{t("paymentDetails")}</h1>

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
