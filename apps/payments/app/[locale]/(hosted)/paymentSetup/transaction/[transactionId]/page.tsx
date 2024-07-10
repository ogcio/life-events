import { getTranslations } from "next-intl/server";
import { errorHandler, formatCurrency } from "../../../../../utils";
import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { TransactionStatuses } from "../../../../../../types/TransactionStatuses";
import Link from "next/link";
import { PaymentsApiFactory } from "../../../../../../libraries/payments-api";

async function getTransactionDetails(transactionId: string) {
  const paymentsApi = await PaymentsApiFactory.getInstance();
  const { data: result, error } =
    await paymentsApi.getTransactionDetails(transactionId);

  if (error) {
    errorHandler(error);
  }

  return result?.data;
}

async function confirmTransaction(transactionId: string) {
  "use server";

  const paymentsApi = await PaymentsApiFactory.getInstance();
  const { error } = await paymentsApi.updateTransaction(transactionId, {
    status: TransactionStatuses.Succeeded,
  });

  if (error) {
    errorHandler(error);
  }

  revalidatePath("/");
}

export default async function ({
  params: { transactionId, locale },
}: {
  params: { transactionId: string; locale: string };
}) {
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
          <Link
            href={`/${locale}/paymentSetup/requests/${details.paymentRequestId}`}
          >
            <dt className="govie-summary-list__value">{details.title}</dt>
          </Link>
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
            {dayjs(details.updatedAt).format("DD/MM/YYYY - HH:mm:ss")}
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

      {details.providerType &&
        details.status === TransactionStatuses.Pending && (
          <form action={confirm}>
            <button className="govie-button govie-button--primary">
              {tRequest("transactionFound")}
            </button>
          </form>
        )}
    </div>
  );
}
