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
import InputField from "../../../components/InputField";

type Props = {
  params: {
    locale: string;
  };
  searchParams: {
    page?: string;
    limit?: string;
    resource?: string;
    action?: string;
    user?: string;
    from?: string;
    to?: string;
  };
};

const transformToTitle = (name: string) => {
  return name
    .split("_")
    .map((word) => {
      return word[0].toUpperCase() + word.slice(1);
    })
    .join(" ");
};

const getResourcesAndActions = (eventTypes: Record<string, string>) => {
  return Object.keys(eventTypes).reduce<{
    resources: Record<string, string>;
    actions: Record<string, string>;
  }>(
    (acc, eventType) => {
      const [resource, action] = eventType.split(".");

      acc.resources[resource] = transformToTitle(resource);
      acc.actions[action] = transformToTitle(action);

      return acc;
    },
    {
      resources: {},
      actions: {},
    },
  );
};

export default async function ({
  params: { locale },
  searchParams: { page, limit, resource, action, user, from, to },
}: Props) {
  const t = await getTranslations("AuditLogs");
  const paymentsApi = await AuthenticationFactory.getPaymentsClient();

  const currentPage = page ? parseInt(page) : PAGINATION_PAGE_DEFAULT;
  const pageLimit = limit ? parseInt(limit) : PAGINATION_LIMIT_DEFAULT;

  const params = {
    offset: pageToOffset(currentPage, pageLimit),
    limit: pageLimit,
    resource,
    action,
    user,
    from,
    to,
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

  const { resources, actions } = getResourcesAndActions(eventTypes);

  const url = `/${locale}/${routeDefinitions.auditLogs.path()}`;
  const links = buildPaginationLinks(url, auditLogsResponse?.metadata?.links);

  const setFilterParam = async (formData: FormData) => {
    "use server";
    const queryItems = {
      page: page ? 1 : undefined,
      limit,
      user: formData.get("user"),
      resource: formData.get("resource"),
      action: formData.get("action"),
    };

    const queryString = Object.entries(queryItems)
      .filter(([_, value]) => !!value)
      .map(([name, value]) => {
        return `${name}=${value}`;
      })
      .join("&");

    redirect(`?${queryString}`);
  };

  return (
    <PageWrapper locale={locale} disableOrgSelector={true}>
      <div className="table-container">
        <div style={{ width: "100%" }}>
          <h1 className="govie-heading-m">{t("title")}</h1>
          <form action={setFilterParam}>
            <InputField
              name="user"
              label={t("filters.user")}
              defaultValue={user}
            />

            <div
              style={{
                display: "flex",
                alignItems: "end",
                gap: "12px",
              }}
            >
              <div className="govie-form-group" style={{ width: "50%" }}>
                <label htmlFor="resource" className="govie-label--s">
                  {t("filters.resource")}
                </label>
                <br />
                <select
                  id="resource"
                  name="resource"
                  className="govie-select"
                  defaultValue={resource ?? ""}
                  style={{ width: "100%" }}
                >
                  <option value={""}>{t("filters.allOption")}</option>
                  {Object.entries(resources).map(([resource, title]) => (
                    <option key={resource} value={resource}>
                      {title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="govie-form-group" style={{ width: "50%" }}>
                <label htmlFor="action" className="govie-label--s">
                  {t("filters.action")}
                </label>
                <br />
                <select
                  id="action"
                  name="action"
                  className="govie-select"
                  defaultValue={action ?? ""}
                  style={{ width: "100%" }}
                >
                  <option value={""}>{t("filters.allOption")}</option>
                  {Object.entries(actions).map(([action, title]) => (
                    <option key={action} value={action}>
                      {title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              data-module="govie-button"
              className="govie-button govie-button--medium"
            >
              {t("filters.submit")}
            </button>
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
                    <tr
                      className="govie-table__row"
                      key={event.auditLogId}
                      data-resource-id={event.resourceId}
                    >
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
