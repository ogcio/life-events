import { getTranslations } from "next-intl/server";
import Link from "next/link";
import RejectReasonForm from "./RejectReasonForm";
import RenewLicenceUserDetails from "./RenewLicenceUserDetails";
import { postgres, web, workflow } from "../../utils";
import { getUserInfoById } from "auth/sessions";
import OrderEHICUserDetails from "./OrderEHICUserDetails";
import { notFound } from "next/navigation";

const isOrderEHICData = (
  flow: string,
  flowData: workflow.Workflow,
): flowData is workflow.OrderEHIC => flow === workflow.keys.orderEHIC;
const isRenewDriversLicenceData = (
  flow: string,
  flowData: workflow.Workflow,
): flowData is workflow.RenewDriversLicence =>
  flow === workflow.keys.renewDriversLicence;

type FormItem = {
  userName: string | undefined;
  userId: string;
  flow: string;
  flowData: workflow.Workflow;
  proofOfAddressFileId?: string | undefined;
};

function getUserDetailsForm(
  evt: string,
  item: FormItem,
  params: web.NextPageProps["params"],
  searchParams: web.NextPageProps["searchParams"],
) {
  if (
    evt === workflow.keys.orderEHIC &&
    isOrderEHICData(item.flow, item.flowData)
  ) {
    return (
      <OrderEHICUserDetails
        flow={item.flow}
        hideFormButtons={Boolean(item.flowData.successfulAt)}
        params={params}
        userId={item.userId}
        searchParams={searchParams}
        flowData={item.flowData}
      />
    );
  }
  if (
    evt === workflow.keys.renewDriversLicence &&
    isRenewDriversLicenceData(item.flow, item.flowData)
  ) {
    return (
      <RenewLicenceUserDetails
        flow={item.flow}
        hideFormButtons={Boolean(item.flowData.successfulAt)}
        params={params}
        userId={item.userId}
        searchParams={searchParams}
        flowData={item.flowData}
      />
    );
  }
  throw notFound();
}

export default async (props: web.NextPageProps) => {
  const t = await getTranslations("Admin.EventsTable");
  const userFlows = await postgres.pgpool.query<{
    userId: string;
    flow: string;
    flowData: workflow.Workflow;
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
        {getUserDetailsForm(
          props.searchParams.evt,
          item,
          props.params,
          props.searchParams,
        )}
        <Link className="govie-back-link" href="/admin">
          {t("back")}
        </Link>
      </>
    );
  }

  const status = (flowData: workflow.Workflow) => {
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
