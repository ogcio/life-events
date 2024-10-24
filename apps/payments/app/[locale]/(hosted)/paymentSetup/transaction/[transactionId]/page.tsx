import { getTranslations } from "next-intl/server";
import { errorHandler, formatCurrency } from "../../../../../utils";
import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { TransactionStatuses } from "../../../../../../types/TransactionStatuses";
import Link from "next/link";
import { AuthenticationFactory } from "../../../../../../libraries/authentication-factory";
import { PageWrapper } from "../../../PageWrapper";

async function getTransactionDetails(transactionId: string) {
  const paymentsApi = await AuthenticationFactory.getPaymentsClient();
  const { data: result, error } =
    await paymentsApi.getTransactionDetails(transactionId);

  if (error) {
    errorHandler(error);
  }

  return result?.data;
}

async function confirmTransaction(transactionId: string) {
  "use server";

  const paymentsApi = await AuthenticationFactory.getPaymentsClient();
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
  const tStatus = await getTranslations("PaymentSetup.paymentStatus");
  const tProviderType = await getTranslations("PaymentSetup.providerType");

  if (!details) {
    notFound();
  }

  const confirm = confirmTransaction.bind(null, transactionId);

  return (
    <PageWrapper locale={locale} disableOrgSelector={true}>
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
            <dt className="govie-summary-list__key">{t("description")}</dt>
            <dt className="govie-summary-list__value">
              <pre style={{ fontFamily: "inherit" }}>{details.description}</pre>
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
            <dt className="govie-summary-list__value">
              {tStatus(details.status)}
            </dt>
          </div>
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">{t("providerName")}</dt>
            <dt className="govie-summary-list__value">
              {details.providerName}
            </dt>
          </div>
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">{t("providerType")}</dt>
            <dt className="govie-summary-list__value">
              {tProviderType(details.providerType)}
            </dt>
          </div>
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">{t("referenceCode")}</dt>
            <dt className="govie-summary-list__value">
              {details.extPaymentId}
            </dt>
          </div>
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">{t("payerName")}</dt>
            <dt className="govie-summary-list__value">
              {details.metadata.name}
            </dt>
          </div>
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">{t("payerEmail")}</dt>
            <dt className="govie-summary-list__value">
              {details.metadata.email}
            </dt>
          </div>
          {details.metadata.runId && (
            <div className="govie-summary-list__row">
              <dt className="govie-summary-list__key">{t("runId")}</dt>
              <dt className="govie-summary-list__value">
                {details.metadata.runId}
              </dt>
            </div>
          )}
          {details.metadata.journeyId && (
            <div className="govie-summary-list__row">
              <dt className="govie-summary-list__key">{t("journeyId")}</dt>
              <dt className="govie-summary-list__value">
                {details.metadata.journeyId}
              </dt>
            </div>
          )}
          {details.metadata.journeyTitle && (
            <div className="govie-summary-list__row">
              <dt className="govie-summary-list__key">{t("journeyTitle")}</dt>
              <dt className="govie-summary-list__value">
                {details.metadata.journeyTitle}
              </dt>
            </div>
          )}
        </dl>

        {details.providerType === "banktransfer" &&
          details.status === TransactionStatuses.Pending && (
            <form action={confirm}>
              <button className="govie-button govie-button--primary">
                {tRequest("transactionFound")}
              </button>
            </form>
          )}
      </div>
    </PageWrapper>
  );
}
