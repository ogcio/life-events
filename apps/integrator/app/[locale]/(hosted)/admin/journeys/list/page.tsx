import { getTranslations } from "next-intl/server";
import { notFound, redirect, RedirectType } from "next/navigation";
import { AuthenticationFactory } from "../../../../../../libraries/authentication-factory";
import { PageWrapper } from "../../../PageWrapper";
import Link from "next/link";
import { EmptyStatus } from "../../../../../components/EmptyStatus";
import dayjs from "dayjs";
import { generateJourneyLink } from "../../../../../utils/journey";
import CopyLink from "../../../../../components/CopyBtn";
import {
  buildPaginationLinks,
  pageToOffset,
  PAGINATION_LIMIT_DEFAULT,
  PAGINATION_PAGE_DEFAULT,
} from "../../../../../utils/pagination";
import { errorHandler } from "../../../../../utils/errorHandler";
import Pagination from "../../../../../components/pagination/pagination";

type Props = {
  params: {
    locale: string;
  };
  searchParams: { page?: string; limit?: string };
};

export default async ({
  params: { locale },
  searchParams: { page, limit },
}: Props) => {
  const t = await getTranslations("Journeys.existingJourneys");
  const tGeneral = await getTranslations("General");
  const currentPage = page ? parseInt(page) : PAGINATION_PAGE_DEFAULT;
  const pageLimit = limit ? parseInt(limit) : PAGINATION_LIMIT_DEFAULT;

  const pagination = {
    offset: pageToOffset(currentPage, pageLimit),
    limit: pageLimit,
  };

  const context = AuthenticationFactory.getInstance();
  const isPublicServant = await context.isPublicServant();

  if (!isPublicServant) {
    return notFound();
  }

  const integratorApi = await AuthenticationFactory.getIntegratorClient();
  const { data: journeys, error } = await integratorApi.getJourneys(pagination);

  const errors = errorHandler(error);

  if (errors?.limit || errors?.offset) {
    return redirect("/error", RedirectType.replace);
  }

  const url = `/${locale}/admin/journeys/list`;
  const links = buildPaginationLinks(url, journeys?.metadata?.links);

  return (
    <PageWrapper locale={locale} disableOrgSelector={true}>
      <div className="table-container">
        <div
          className="govie-width-container"
          style={{ width: "100%", fontSize: "16px" }}
        >
          <Link className="govie-link" href={`/${locale}/admin/journeys`}>
            {`< ${tGeneral("back")}`}
          </Link>
        </div>
        <section
          style={{
            margin: "1rem 0",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h1 className="govie-heading-m">{t("title")}</h1>
          {journeys?.data.length === 0 ? (
            <EmptyStatus
              title={t("empty.title")}
              description={t("empty.description")}
            />
          ) : (
            <div
              style={{
                width: "100%",
                overflowX: "auto",
              }}
            >
              <table
                className={`govie-table scrollable-table`}
                style={{ tableLayout: "fixed" }}
              >
                <thead className="govie-table__head">
                  <tr className="govie-table__row">
                    <th
                      scope="col"
                      className="govie-table__header"
                      style={{ width: "80px" }}
                    >
                      {t("tableHeaders.id")}
                    </th>
                    <th scope="col" className="govie-table__header">
                      {t("tableHeaders.name")}
                    </th>
                    <th
                      scope="col"
                      className="govie-table__header"
                      style={{ width: "180px" }}
                    >
                      {t("tableHeaders.createdBy")}
                    </th>
                    <th
                      scope="col"
                      className="govie-table__header"
                      style={{ width: "130px" }}
                    >
                      {t("tableHeaders.created")}
                    </th>
                    <th
                      scope="col"
                      className="govie-table__header"
                      style={{ width: "130px" }}
                    >
                      {t("tableHeaders.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="govie-table__body">
                  {journeys?.data.map(async (journey) => (
                    <tr
                      className="govie-table__row"
                      key={journey.id}
                      data-journey-id={journey.id}
                    >
                      <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                        <div
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={`#${journey.id}`}
                        >
                          {`#${journey.id}`}
                        </div>
                      </td>
                      <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                        {journey.title}
                      </td>
                      <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                        {journey.userName}
                      </td>
                      <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                        {dayjs(journey.createdAt).format("DD/MM/YYYY")}
                      </td>
                      <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                        <div
                          style={{
                            minWidth: "190px",
                          }}
                        >
                          <Link
                            className="govie-link"
                            href={`/${locale}/admin/journeys/details/${journey.id}`}
                            style={{
                              marginRight: "12px",
                            }}
                          >
                            {tGeneral("view")}
                          </Link>

                          <CopyLink
                            link={generateJourneyLink(journey.id)}
                            buttonText={tGeneral("copyLink")}
                            linkStyle={true}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination links={links} currentPage={currentPage}></Pagination>
            </div>
          )}
        </section>
      </div>
    </PageWrapper>
  );
};
