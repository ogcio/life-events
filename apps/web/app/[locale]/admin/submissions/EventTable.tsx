import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { postgres, web, workflow } from "../../../utils";
import { Pages, SubmissionsTableProps } from "./page";
import {
  PaginationLinks,
  getPaginationDataFromParams,
  getPaginationLinks,
} from "./components/paginationUtils";
import Pagination from "./components/Pagination";

export default async ({ searchParams, params }: SubmissionsTableProps) => {
  const t = await getTranslations("Admin.EventsTable");

  //allow only submitted approved rejected from Pages type excluding pending
  const statusSelection =
    (searchParams?.status as Exclude<Pages, "pending">) || "submitted";

  const urlParms = new URLSearchParams(searchParams);
  const url = `${process.env.HOST_URL}${params.locale}/admin/submissions?status=${statusSelection}`;

  const pagination = getPaginationDataFromParams(urlParms);

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

  const userFlows = await postgres.pgpool.query<{
    userId: string;
    flow: string;
    flowData: workflow.GetDigitalWallet;
    updatedAt: string;
  }>(
    `${dataSelect} ${dataQuery} ORDER BY updated_at DESC  LIMIT $1 OFFSET $2`,
    [pagination.limit, pagination.offset],
  );

  const countQueryResult = await postgres.pgpool.query<{
    count: number;
  }>(`SELECT COUNT(*) ${dataQuery}`);

  const count = countQueryResult.rows[0].count;

  const links: PaginationLinks = getPaginationLinks({
    url,
    limit: pagination.limit,
    offset: pagination.offset,
    totalCount: count,
  });

  const status = (flowData: workflow.GetDigitalWallet) => {
    if (flowData.successfulAt) {
      return "Approved";
    }

    if (flowData.rejectedAt) {
      return "Rejected";
    }

    return "Submitted";
  };

  return (
    <>
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
                  {row.flowData.deviceType}
                </td>

                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  {row.flowData.verifiedGovIEEmail ? "Yes" : "No"}
                </td>

                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  <div>
                    <div>
                      {status(row.flowData) === "Submitted" ? (
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
                      ) : null}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Pagination currentPage={pagination.page} links={links} />
    </>
  );
};
