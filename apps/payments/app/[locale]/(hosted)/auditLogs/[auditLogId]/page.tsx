import { getTranslations } from "next-intl/server";
import dayjs from "dayjs";
import { notFound } from "next/navigation";
import { AuthenticationFactory } from "../../../../../libraries/authentication-factory";
import { errorHandler } from "../../../../utils";
import { PageWrapper } from "../../PageWrapper";

async function getAuditLogDetails(auditLogId: string) {
  const paymentsApi = await AuthenticationFactory.getPaymentsClient();
  const { data, error } = await paymentsApi.getAuditLogDetails(auditLogId);

  if (error) errorHandler(error);

  return data;
}

export default async function ({
  params: { auditLogId, locale },
}: {
  params: { auditLogId: string; locale: string };
}) {
  const [t, details] = await Promise.all([
    getTranslations("AuditLogs.details"),
    getAuditLogDetails(auditLogId),
  ]);

  if (!details) notFound();

  return (
    <PageWrapper locale={locale} disableOrgSelector={true}>
      <div className="table-container">
        <div style={{ width: "100%" }}>
          <h1 className="govie-heading-m">{details.title}</h1>
          <dl className="govie-summary-list">
            <div className="govie-summary-list__row">
              <dt className="govie-summary-list__key">{t("eventTitle")}</dt>
              <dt className="govie-summary-list__value">{details.title}</dt>
            </div>
            <div className="govie-summary-list__row">
              <dt className="govie-summary-list__key">{t("timestamp")}</dt>
              <dt className="govie-summary-list__value">
                {dayjs(details.createdAt).format("DD/MM/YYYY - HH:mm:ss")}
              </dt>
            </div>
            <div className="govie-summary-list__row">
              <dt className="govie-summary-list__key">{t("eventType")}</dt>
              <dt className="govie-summary-list__value">{details.eventType}</dt>
            </div>
            <div className="govie-summary-list__row">
              <dt className="govie-summary-list__key">{t("userId")}</dt>
              <dt className="govie-summary-list__value">{details.userId}</dt>
            </div>
            <div className="govie-summary-list__row">
              <dt className="govie-summary-list__key">{t("organizationId")}</dt>
              <dt className="govie-summary-list__value">
                {details.organizationId}
              </dt>
            </div>
            <div className="govie-summary-list__row">
              <dt className="govie-summary-list__key">{t("metadata")}</dt>
              <dt className="govie-summary-list__value">
                {JSON.stringify(details.metadata)}
              </dt>
            </div>
          </dl>
        </div>
      </div>
    </PageWrapper>
  );
}
