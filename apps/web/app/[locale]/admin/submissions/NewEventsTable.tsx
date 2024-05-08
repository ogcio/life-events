import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { postgres, web, workflow } from "../../../utils";
import dayjs from "dayjs";
import { QueryResult } from "pg";

export default async (props: web.NextPageProps) => {
  const t = await getTranslations("Admin.EventsTable");

  const statusSelection = props.searchParams?.status || "pending";

  let userFlows: QueryResult<{
    userId: string;
    flow: string;
    flowData: workflow.GetDigitalWallet;
    updatedAt: string;
  }> | null = null;

  try {
    let query = `SELECT 
  fd.user_id as "userId", 
  fd.flow,
  fd.flow_data as "flowData",
  fd.updated_at::DATE::TEXT as "updatedAt"
  FROM user_flow_data fd
  ORDER BY updated_at DESC
  `;

    userFlows = await postgres.pgpool.query<{
      userId: string;
      flow: string;
      flowData: workflow.GetDigitalWallet;
      updatedAt: string;
    }>(query);
  } catch (err) {
    console.log(err);
  }

  function getApprovalStatus({
    flow,
    flowData,
  }: {
    flow: string;
    flowData: workflow.GetDigitalWallet;
  }) {
    const { approvalStages } = flowData;

    const totalApprovalStages = workflow.workFlowApprovalStages[flow];
    const remainingStages =
      totalApprovalStages - flowData.approvalStages.length;

    if (!approvalStages.length || statusSelection === "pending") {
      return t("pending");
    }

    return (
      <div>
        {approvalStages.map((stage) => (
          <div>
            <p style={{ marginBottom: 0 }}>
              {t(`${stage.status}by`)} {stage.reviewer}
            </p>
            <p className="govie-body-s" style={{ marginTop: 0 }}>
              <span>{`${dayjs(stage.date).format("DD-MM-YYYY HH:mm")}`}</span>
            </p>
          </div>
        ))}
        {statusSelection === "all" &&
        remainingStages > 0 &&
        !approvalStages.find((obj) => obj.status == "rejected")
          ? Array.from({ length: remainingStages }).map((_, index) => (
              <div>
                <p>{t("pending")}</p>
              </div>
            ))
          : null}
      </div>
    );
  }

  function getApprovalStage({
    flow,
    flowData,
  }: {
    flow: string;
    flowData: workflow.GetDigitalWallet;
  }) {
    const { approvalStages } = flowData;

    const totalApprovalStages = workflow.workFlowApprovalStages[flow];

    if (!approvalStages.length) {
      return `1 ${t("of")} ${totalApprovalStages}`;
    }

    if (statusSelection === "pending") {
      const nextStage = approvalStages.length + 1;
      return `${nextStage} ${t("of")} ${totalApprovalStages}`;
    }

    if (statusSelection === "all") {
      return Array.from({ length: totalApprovalStages }).map((_, index) => (
        <div>
          <p>{`${index + 1} ${t("of")} ${totalApprovalStages}`}</p>
        </div>
      ));
    }

    return approvalStages.map((stage) => (
      <div>
        <p>{`${stage.stage} ${t("of")} ${totalApprovalStages}`}</p>
      </div>
    ));
  }

  const filteredFlows = userFlows?.rows?.filter((row) => {
    const { approvalStages } = row.flowData;
    const totalApprovalStages = workflow.workFlowApprovalStages[row.flow];

    if (statusSelection === "all") {
      return row;
    }
    if (statusSelection === "pending") {
      return (
        !approvalStages.find((obj) => obj.status == "rejected") &&
        approvalStages.length < totalApprovalStages
      );
    }

    if (statusSelection === "approved") {
      return approvalStages.find((obj) => obj.status == "approved");
    }

    if (statusSelection === "rejected") {
      return approvalStages.find((obj) => obj.status == "rejected");
    }
  });

  return (
    <table className="govie-table">
      <thead className="govie-table__head">
        <tr className="govie-table__row">
          <th scope="col" className="govie-table__header">
            {t("idColumn")}
          </th>
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
            {t("stageColumn")}
          </th>
          <th scope="col" className="govie-table__header">
            {t("actionColumn")}
          </th>
        </tr>
      </thead>
      <tbody className="govie-table__body">
        {filteredFlows?.map((row) => {
          return (
            <tr key={row.userId} className="govie-table__row">
              <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                {row.userId.slice(0, 6)}
              </td>
              <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                {web.formatDate(row.flowData.submittedAt)}
              </td>

              <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                {t(row.flow)}
              </td>

              <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                {getApprovalStatus({ flow: row.flow, flowData: row.flowData })}
              </td>

              <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                {getApprovalStage({ flow: row.flow, flowData: row.flowData })}
              </td>

              <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                <div>
                  <div>
                    <Link
                      className="govie-link govie-!-margin-right-3"
                      href={{
                        pathname: new URL(
                          `/admin/submissions/${row.flow}/${row.userId}`,
                          process.env.HOST_URL,
                        ).href,
                        query: {
                          action:
                            statusSelection === "pending" ? "review" : "view",
                        },
                      }}
                    >
                      {statusSelection === "pending" ? t("review") : t("view")}
                    </Link>
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
