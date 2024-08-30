import { getTranslations } from "next-intl/server";
import Link from "next/link";
import dayjs from "dayjs";
import { EmptyStatus } from "../../../components/EmptyStatus";
import {
  buildPaginationLinks,
  errorHandler,
  pageToOffset,
  PAGINATION_LIMIT_DEFAULT,
  PAGINATION_PAGE_DEFAULT,
} from "../../../utils";
import { routeDefinitions } from "../../../routeDefinitions";
import Pagination from "../../../components/pagination";
import { redirect, RedirectType } from "next/navigation";
import { AuthenticationFactory } from "../../../../libraries/authentication-factory";
import { PageWrapper } from "../PageWrapper";

type Props = {
  params: {
    locale: string;
  };
  searchParams: { page?: string; limit?: string; eventType?: string };
};

export default async function ({
  params: { locale },
  searchParams: { page, limit, eventType },
}: Props) {
  const t = await getTranslations("AuditLogs");
  const paymentsApi = await AuthenticationFactory.getPaymentsClient();

  const currentPage = page ? parseInt(page) : PAGINATION_PAGE_DEFAULT;
  const pageLimit = limit ? parseInt(limit) : PAGINATION_LIMIT_DEFAULT;

  const params = {
    offset: pageToOffset(currentPage, pageLimit),
    limit: pageLimit,
    eventType,
  };

  const { data: auditLogsResponse, error } =
    await paymentsApi.getAuditLogEvents(params);

  const errors = errorHandler(error);

  if (errors?.limit || errors?.offset) {
    return redirect("/error", RedirectType.replace);
  }

  const { data: eventTypesResponse } =
    await paymentsApi.getAuditLogEventTypes();
  const eventTypes = eventTypesResponse?.data ?? {};

  const url = `/${locale}/${routeDefinitions.auditLogs.path()}`;
  const links = buildPaginationLinks(url, auditLogsResponse?.metadata?.links);

  const setFilterParam = async (formData: FormData) => {
    "use server";
    const queryItems: Array<string> = [];

    if (page) {
      queryItems.push(`page=${page}`);
    }

    if (limit) {
      queryItems.push(`limit=${limit}`);
    }

    const selectedEventType = formData.get("eventType");

    if (selectedEventType) {
      queryItems.push(`eventType=${selectedEventType}`);
    }

    redirect(`?${queryItems.join("&")}`);
  };

  return (
    <PageWrapper locale={locale} disableOrgSelector={true}>
      <div className="table-container">
        <div
          style={{
            width: "100%",
          }}
        >
          <h1 className="govie-heading-m">{t("title")}</h1>

          <form action={setFilterParam}>
            <div
              style={{
                display: "flex",
                alignItems: "end",
                gap: "12px",
              }}
            >
              <div className="govie-form-group">
                <label htmlFor="event-type" className="govie-label--s">
                  {t("filter.label")}
                </label>
                <br />
                <select
                  id="event-type"
                  name="eventType"
                  className="govie-select"
                  defaultValue={eventType ?? ""}
                  style={{ width: "150px" }}
                >
                  <option value={""}>{t("filter.allEventsOption")}</option>
                  {Object.entries(eventTypes).map(([type, title]) => (
                    <option key={type} value={type}>
                      {title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                data-module="govie-button"
                className="govie-button govie-button--medium"
              >
                {t("filter.action")}
              </button>
            </div>
          </form>

          {auditLogsResponse?.data.length === 0 ? (
            <EmptyStatus
              title={t("emptyListTitle")}
              description={t("emptyListDescription")}
            />
          ) : (
            <div>
              <table className="govie-table">
                <thead className="govie-table__head">
                  <tr className="govie-table__row">
                    <th scope="col" className="govie-table__header">
                      {t("table.eventType")}
                    </th>
                    <th scope="col" className="govie-table__header">
                      {t("table.creationDate")}
                    </th>
                    <th scope="col" className="govie-table__header">
                      {t("table.user")}
                    </th>
                    <th scope="col" className="govie-table__header">
                      {t("table.details")}
                    </th>
                  </tr>
                </thead>
                <tbody className="govie-table__body">
                  {auditLogsResponse?.data.map((event) => (
                    <tr className="govie-table__row" key={event.auditLogId}>
                      <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                        {event.title}
                      </td>
                      <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                        {dayjs(event.createdAt).format("DD/MM/YYYY - HH:mm")}
                      </td>

                      <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                        {event.userId}
                      </td>
                      <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                        <Link href={`/${locale}/auditLogs/${event.auditLogId}`}>
                          {t("table.details")}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination links={links} currentPage={currentPage}></Pagination>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}