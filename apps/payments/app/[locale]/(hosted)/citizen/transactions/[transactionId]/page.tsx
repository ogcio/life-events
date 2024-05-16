import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import { Payments } from "building-blocks-sdk";
import { getUser } from "../../../../../../libraries/auth";
import { notFound } from "next/navigation";
import { errorHandler, formatCurrency } from "../../../../../utils";
import dayjs from "dayjs";

export default async function ({ params: { transactionId } }) {
  const t = await getTranslations("MyPayments.details");

  let userId;
  if (process.env.USE_LOGTO_AUTH === "true") {
    userId = (await getUser()).id;
  } else {
    userId = (await PgSessions.get()).userId;
  }

  const { data: details, error } = await new Payments(
    userId,
  ).getCitizenTransactionDetails(transactionId);

  if (error) {
    errorHandler(error);
  }

  if (!details) {
    return notFound();
  }

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
            {dayjs(details.updatedAt).format("DD/MM/YYYY - HH:mm:ss")}
          </dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("status")}</dt>
          <dt className="govie-summary-list__value">{details.status}</dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("providerType")}</dt>
          <dt className="govie-summary-list__value">
            {t(`providers.${details.providerType}`)}
          </dt>
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
    </div>
  );
}
