import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { postgres, web, workflow } from "../../../utils";
import dayjs from "dayjs";

export default async (props: web.NextPageProps) => {
  const t = await getTranslations("Admin.EventsTable");

  let query = `SELECT 
  fd.user_id as "userId", 
  fd.flow,
  fd.flow_data as "flowData",
  fd.updated_at::DATE::TEXT as "updatedAt"
  FROM user_flow_data fd`;

  const statusSelection = props.searchParams?.status;

  switch (statusSelection) {
    case "closed":
      query += ` WHERE (flow_data ->> 'rejectReason') != ''`;
      break;
    case "approved":
      query += ` WHERE (flow_data ->> 'successfulAt') != ''`;
      break;
    case undefined:
    case "pending":
      query += ` WHERE (flow_data ->> 'successfulAt') = '' AND (flow_data ->> 'rejectReason') = ''`;
      break;
    case "all":
      break;
    default:
      // No funny queries
      query += " WHERE FALSE";
      break;
  }

  query += " ORDER BY updated_at DESC";

  const userFlows = await postgres.pgpool.query<{
    userId: string;
    flow: string;
    flowData: workflow.RenewDriversLicence;
    updatedAt: string;
  }>(query);

  const status = (flowData: workflow.RenewDriversLicence) => {
    if (flowData.successfulAt) {
      return "Approved";
    }

    if (flowData.rejectReason) {
      return "Rejected";
    }

    return "Pending";
  };

  return (
    <table className="govie-table">
      <thead className="govie-table__head">
        <tr className="govie-table__row">
          <th scope="col" className="govie-table__header">
            {t("dateColumn")}
          </th>
          <th scope="col" className="govie-table__header">
            {t("typeColumn")}
          </th>
          <th scope="col" className="govie-table__header">
            {t("statusColumn")}
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
                {dayjs(row.updatedAt).format("DD/MM/YYYY")}
              </td>

              <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                {t(row.flow)}
              </td>

              <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                {status(row.flowData)}
              </td>

              <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                <div>
                  <div>
                    {status(row.flowData) === "Pending" ? (
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
  );
};
