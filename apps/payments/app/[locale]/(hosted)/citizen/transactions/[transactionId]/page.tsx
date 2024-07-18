import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { errorHandler, formatCurrency } from "../../../../../utils";
import dayjs from "dayjs";
import { AuthenticationFactory } from "../../../../../../libraries/authentication-factory";

export default async function ({ params: { transactionId } }) {
  const t = await getTranslations("MyPayments.details");
  const paymentsApi = await AuthenticationFactory.getPaymentsClient();

  const { data: details, error } =
    await paymentsApi.getCitizenTransactionDetails(transactionId);

  if (error) {
    errorHandler(error);
  }

  if (!details?.data) {
    return notFound();
  }

  return (
    <div>
      <h1 className="govie-heading-l">{t("paymentDetails")}</h1>

      <dl className="govie-summary-list">
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("requestTitle")}</dt>
          <dt className="govie-summary-list__value">{details.data.title}</dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("amount")}</dt>
          <dt className="govie-summary-list__value">
            {formatCurrency(details.data.amount)}
          </dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("lastUpdate")}</dt>
          <dt className="govie-summary-list__value">
            {dayjs(details.data.updatedAt).format("DD/MM/YYYY - HH:mm:ss")}
          </dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("status")}</dt>
          <dt className="govie-summary-list__value">{details.data.status}</dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("providerType")}</dt>
          <dt className="govie-summary-list__value">
            {t(`providers.${details.data.providerType}`)}
          </dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("referenceCode")}</dt>
          <dt className="govie-summary-list__value">
            {details.data.extPaymentId}
          </dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("payerName")}</dt>
          <dt className="govie-summary-list__value">
            {details.data.userData.name}
          </dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("payerEmail")}</dt>
          <dt className="govie-summary-list__value">
            {details.data.userData.email}
          </dt>
        </div>
      </dl>
    </div>
  );
}
