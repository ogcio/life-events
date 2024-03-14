import { getTranslations } from "next-intl/server";
import Link from "next/link";
import RejectReasonForm from "./RejectReasonForm";
import RenewLicenceUserDetails from "./RenewLicenceUserDetails";
import { postgres, web, workflow } from "../../utils";
import { getUserInfoById } from "auth/sessions";

export default async (props: web.NextPageProps) => {
  const t = await getTranslations("Admin.EventsTable");
  const userFlows = await postgres.pgpool.query<{
    userId: string;
    flow: string;
    flowData: workflow.RenewDriversLicence;
    proofOfAddressFileId?: string;
  }>(`
  SELECT 
    fd.user_id as "userId", 
    fd.flow,
    fd.flow_data as "flowData"
    FROM user_flow_data fd
  `);
  
  if (props.searchParams && Object.keys(props.searchParams).length) {
    const baseItem = userFlows.rows.find(
      (row) =>
        row.userId === props.searchParams?.uid &&
        props.searchParams?.evt === row.flow,
    );

    if (!baseItem) {
      return (
        <>
          <h1>{t("eventNotFound")}</h1>
          <Link className="govie-back-link" href="/admin">
            {t("back")}
          </Link>
        </>
      );
    }

    const user = await getUserInfoById(baseItem.userId);
    const item = { ...baseItem, userName: user?.user_name };

    const searchParamsWithRejectionOpen = new URLSearchParams(
      props.searchParams,
    );
    searchParamsWithRejectionOpen.append("open", "rejection");
    return (
      <>
        {props.searchParams.open === "rejection" && (
          <RejectReasonForm
            flow={item.flow}
            params={props.params}
            userId={item.userId}
            searchParams={props.searchParams}
          />
        )}
        <RenewLicenceUserDetails
          flow={item.flow}
          hideFormButtons={Boolean(item.flowData.successfulAt)}
          params={props.params}
          userId={item.userId}
          searchParams={props.searchParams}
          flowData={item.flowData}
        />

        <Link className="govie-back-link" href="/admin">
          {t("back")}
        </Link>
      </>
    );
  }

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
    <>
      <h1>{t("title")}</h1>
      <table className="govie-table">
        <thead className="govie-table__head">
          <tr className="govie-table__row">
            <th scope="col" className="govie-table__header">
              {t("nameColumn")}
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
                  {row.flowData.userName}
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
                      <Link
                        className="govie-link govie-!-margin-right-3"
                        href={`?uid=${row.userId}&evt=${row.flow}`}
                      >
                        {t("view")}
                      </Link>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};
