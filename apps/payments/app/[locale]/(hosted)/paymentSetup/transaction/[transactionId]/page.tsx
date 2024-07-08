import { getTranslations } from "next-intl/server";
import { errorHandler, formatCurrency } from "../../../../../utils";
import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { TransactionStatuses } from "../../../../../../types/TransactionStatuses";
import Link from "next/link";
import { Payments } from "building-blocks-sdk";
import { getPaymentsPublicServantContext } from "../../../../../../libraries/auth";

async function getTransactionDetails(
  transactionId: string,
  accessToken: string,
) {
  const { data: result, error } = await new Payments(
    accessToken,
  ).getTransactionDetails(transactionId);

  if (error) {
    errorHandler(error);
  }

  return result?.data;
}

async function confirmTransaction(transactionId: string, accessToken: string) {
  "use server";
  const { error } = await new Payments(accessToken).updateTransaction(
    transactionId,
    {
      status: TransactionStatuses.Succeeded,
    },
  );

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
  const { accessToken } = await getPaymentsPublicServantContext();

  if (!accessToken) {
    return notFound();
  }

  const [t, details, tRequest] = await Promise.all([
    getTranslations("PaymentSetup.Request.details"),
    getTransactionDetails(transactionId, accessToken),
    getTranslations("PaymentSetup.Request"),
  ]);

  if (!details) {
    notFound();
  }

  const confirm = confirmTransaction.bind(null, transactionId, accessToken);

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
