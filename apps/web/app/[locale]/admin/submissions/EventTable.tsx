import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { postgres, web, workflow } from "../../../utils";
import { Pages, SubmissionsTableProps } from "./page";
import {
  PaginationLinks,
  getPaginationLinks,
  getQueryParams,
} from "./components/paginationUtils";
import Pagination from "./components/Pagination";
import TableControls from "./components/TableControls/TableControls";
import { QueryResult } from "pg";

export default async ({ searchParams, params }: SubmissionsTableProps) => {
  const t = await getTranslations("Admin.EventsTable");

  //allow only submitted approved rejected from Pages type excluding pending
  const statusSelection =
    (searchParams?.status as Exclude<Pages, "pending">) || "submitted";

  const urlParms = new URLSearchParams(searchParams);
  const url = `${process.env.HOST_URL}/${params.locale}/admin/submissions?status=${statusSelection}`;

  const queryParams = getQueryParams(urlParms);

  const dataSelect = `SELECT 
  fd.user_id as "userId", 
  fd.flow,
  fd.flow_data as "flowData",
  fd.updated_at::DATE::TEXT as "updatedAt"`;

  let dataQuery = `
  FROM user_flow_data fd`;

  switch (statusSelection) {
    case "rejected":
      dataQuery += ` WHERE (flow_data ->> 'rejectedAt') != ''`;
      break;
    case "approved":
      dataQuery += ` WHERE (flow_data ->> 'successfulAt') != ''`;
      break;
    case "submitted":
      dataQuery += ` WHERE (flow_data ->> 'confirmedApplication') != '' AND (flow_data ->> 'successfulAt') = '' AND (flow_data ->> 'rejectedAt') = ''`;
      break;
    case undefined:
    default:
      // No funny queries
      dataQuery += " WHERE FALSE";
      break;
  }

  let userFlows: QueryResult<{
    userId: string;
    flow: string;
    flowData: workflow.GetDigitalWallet;
    updatedAt: string;
  }>;

  const sqlQueryParams: (string | boolean)[] = [];
  let paramIndex = 1;
  if (queryParams.search) {
    dataQuery += ` AND (
      (flow_data ->> 'govIEEmail') ILIKE $${paramIndex}
      OR (flow_data ->> 'myGovIdEmail') ILIKE $${paramIndex}
      OR (flow_data ->> 'firstName') ILIKE $${paramIndex}
      OR (flow_data ->> 'lastName') ILIKE $${paramIndex}
      )`;
    paramIndex++;
    sqlQueryParams.push(`%${queryParams.search}%`);
  }

  const filters = queryParams.filters;
  for (const [key, value] of Object.entries(filters)) {
    dataQuery += ` AND (flow_data ->> $${paramIndex} = $${paramIndex + 1}::TEXT)`;
    sqlQueryParams.push(key);
    sqlQueryParams.push(value);

    paramIndex += 2;
  }

  userFlows = await postgres.pgpool.query(
    `${dataSelect} ${dataQuery} ORDER BY updated_at DESC  LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
    [...sqlQueryParams, queryParams.limit, queryParams.offset],
  );

  const countQueryResult = await postgres.pgpool.query<{ count: number }>(
    `SELECT COUNT(*) ${dataQuery}`,
    sqlQueryParams,
  );

  const count = countQueryResult.rows[0].count;

  const links: PaginationLinks = getPaginationLinks({
    url,
    limit: queryParams.limit,
    offset: queryParams.offset,
    totalCount: count,
  });

  return (
    <>
      <TableControls
        itemsCount={count}
        baseUrl={url}
        {...queryParams}
        status={statusSelection}
      />
      <table className="govie-table">
        <thead className="govie-table__head">
          <tr className="govie-table__row">
            <th scope="col" className="govie-table__header">
              {t("dateColumn")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("nameColumn")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("myGovIdEmailColumn")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("deviceColumn")}
            </th>

            <th scope="col" className="govie-table__header">
              {t("verifiedWorkEmail")}
            </th>

            <th scope="col" className="govie-table__header">
              {t("actionColumn")}
            </th>
          </tr>
        </thead>
        <tbody className="govie-table__body">
          {userFlows.rows.map((row) => {
            return (
              <tr key={row.userId} className="govie-table__row">
                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  {web.formatDate(row.updatedAt)}
                </td>

                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  {row.flowData.firstName} {row.flowData.lastName}
                </td>
                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  {row.flowData.govIEEmail}
                </td>

                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  {t(row.flowData.deviceType)}
                </td>

                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  {row.flowData.verifiedGovIEEmail ? "Yes" : "No"}
                </td>

                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  <Link
                    className="govie-link govie-!-margin-right-3"
                    href={
                      new URL(
                        `/admin/submissions/${row.flow}/${row.userId}`,
                        process.env.HOST_URL,
                      ).href
                    }
                  >
                    {t("view")}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Pagination currentPage={queryParams.page} links={links} />
    </>
  );
};
