import { getTranslations } from "next-intl/server";
import { errorHandler, formatCurrency } from "../../../../utils";
import dayjs from "dayjs";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AuthenticationFactory } from "../../../../../libraries/authentication-factory";
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
    getTranslations("AuditLogs"),
    getAuditLogDetails(auditLogId),
  ]);

  if (!details) notFound();

  return (
    <PageWrapper locale={locale} disableOrgSelector={true}>
      <div>
        <h1 className="govie-heading-l">audit log details</h1>

        {JSON.stringify(details)}
      </div>
    </PageWrapper>
  );
}
