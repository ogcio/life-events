import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { postgres, routes, web, workflow } from "../../../../utils";
import { ListRow } from "../../../[event]/[...action]/shared/SummaryListRow";
import FormLayout from "../../../../components/FormLayout";
import dayjs from "dayjs";
import { PgSessions } from "auth/sessions";

type Props = {
  flowData: workflow.GetDigitalWallet;
  flow: string;
  userId: string;
  action: string;
};

export default async ({ userId, flow, flowData, action }: Props) => {
  const t = await getTranslations("Admin.GetDigitalWalletDetails");

  const totalApprovalStages = workflow.workFlowApprovalStages[flow];

  async function approveAction() {
    "use server";

    let currentFlowData: workflow.GetDigitalWallet | undefined;
    try {
      const result = await postgres.pgpool.query<{
        flow_data: workflow.GetDigitalWallet;
      }>(
        `SELECT flow_data FROM user_flow_data WHERE user_id = $1 AND flow = $2`,
        [userId, flow],
      );
      currentFlowData = result.rows.at(0)?.flow_data;
    } catch (err) {
      console.log(err);
      throw new Error("Could not get current workflow data");
    }

    if (!currentFlowData) {
      throw new Error("Could not get current workflow data");
    }

    const { firstName, lastName } = await PgSessions.get();

    const reviewerName = `${firstName} ${lastName}`;

    const currentStage = currentFlowData.approvalStages.length;
    const newStage = currentFlowData.approvalStages.length + 1;

    let dataToUpdate: workflow.GetDigitalWallet;
    if (currentStage < totalApprovalStages) {
      const approvalStages: workflow.GetDigitalWallet["approvalStages"] = [
        ...currentFlowData.approvalStages,
        {
          stage: newStage,
          status: "approved",
          reviewer: reviewerName,
          date: dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss.SSSSSSZ"),
        },
      ];

      Object.assign(currentFlowData, { approvalStages: approvalStages });
      dataToUpdate = currentFlowData;

      try {
        await postgres.pgpool.query(
          `
              INSERT INTO user_flow_data (user_id, flow, flow_data, category)
              VALUES ($1, $2, $3, $4)
              ON CONFLICT (flow, user_id)
              DO UPDATE SET flow_data = $3
              WHERE user_flow_data.user_id=$1 AND user_flow_data.flow=$2
          `,
          [
            userId,
            workflow.keys.getDigitalWallet,
            JSON.stringify(dataToUpdate),
            workflow.categories.digitalWallet,
          ],
        );
      } catch (err) {
        console.log(err);
        throw new Error("Could not approve workflow stage");
      }
    }

    redirect("/admin");
  }

  async function rejectAction() {
    "use server";

    const url = new URL(
      `${headers().get("x-pathname")}/reject-new`,
      process.env.HOST_URL,
    ).href;
    redirect(url);
  }

  const canBeReviewed =
    flowData.approvalStages.length < totalApprovalStages &&
    !flowData.approvalStages.find((obj) => obj.status === "rejected") &&
    action === "review";

  return (
    <FormLayout
      action={{ slug: "submissions." + flow }}
      backHref={`/${routes.admin.slug}`}
      homeHref={`/${routes.admin.slug}`}
    >
      <h1 className="govie-heading-l">
        {t(`${canBeReviewed ? "review" : "view"}`, {
          flow: t(flow).toLowerCase(),
        })}
      </h1>
      <div className="govie-grid-row">
        <div className="govie-grid-column-two-thirds-from-desktop">
          <dl className="govie-summary-list">
            <ListRow
              item={{
                key: t("submittedOn"),
                value: dayjs(flowData.submittedAt).format("DD-MM-YYYY HH:mm"),
              }}
            />
            <ListRow
              item={{ key: t("firstName"), value: flowData.firstName }}
            />
            <ListRow
              item={{
                key: t("lastName"),
                value: flowData.lastName,
              }}
            />
            <ListRow
              item={{ key: t("myGovIdEmail"), value: flowData.myGovIdEmail }}
            />
            <ListRow
              item={{
                key: t("govIEEmail"),
                value: flowData.govIEEmail,
              }}
            />
            <ListRow
              item={{
                key: t("lineManagerName"),
                value: flowData.lineManagerName,
              }}
            />

            <ListRow item={{ key: t("jobTitle"), value: flowData.jobTitle }} />
            <ListRow
              item={{ key: t("appStoreEmail"), value: flowData.appStoreEmail }}
            />
          </dl>

          {!canBeReviewed && (
            <div>
              <h2 className="govie-heading-m">{t("approvalSteps")}</h2>
              <table className="govie-table">
                <thead className="govie-table__head">
                  <tr className="govie-table__row">
                    <th scope="col" className="govie-table__header">
                      {t("status")}
                    </th>
                    <th scope="col" className="govie-table__header">
                      {t("date")}
                    </th>
                    <th scope="col" className="govie-table__header">
                      {t("reviewer")}
                    </th>
                    <th scope="col" className="govie-table__header">
                      {t("stage")}
                    </th>
                    {flowData.approvalStages.find(
                      (obj) => obj.status === "rejected",
                    ) && (
                      <th scope="col" className="govie-table__header">
                        {t("rejectReason")}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="govie-table__body">
                  {flowData.approvalStages.length ? (
                    flowData.approvalStages.map((obj) => (
                      <tr className="govie-table__row">
                        <th className="govie-table__header" scope="row">
                          <strong
                            className={`govie-tag ${obj.status === "approved" ? "govie-tag--green" : "govie-tag--red"}`}
                          >
                            {t(`${obj.status}`)}
                          </strong>
                        </th>
                        <td className="govie-table__cell">
                          {dayjs(obj.date).format("YYYY-MM-DD HH:mm")}
                        </td>
                        <td className="govie-table__cell">{obj.reviewer}</td>
                        <td className="govie-table__cell">{`${obj.stage} ${t("of")} ${totalApprovalStages}`}</td>
                        <td className="govie-table__cell">
                          {obj.rejectReason}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="govie-table__row">
                      <th className="govie-table__header" scope="row">
                        <strong className="govie-tag govie-tag--yellow">
                          {t("pending")}
                        </strong>
                      </th>
                      <td className="govie-table__cell"></td>
                      <td className="govie-table__cell"></td>
                      <td className="govie-table__cell"></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {canBeReviewed && (
            <form
              action={approveAction}
              style={{ display: "flex", alignItems: "baseline", gap: "20px" }}
            >
              <button
                className="govie-button govie-button--tertiary govie-button--medium"
                formAction={rejectAction}
              >
                {t("reject")}
              </button>
              <button
                type="submit"
                className="govie-button govie-button--medium"
              >
                {t("approve")}
              </button>
            </form>
          )}
        </div>
      </div>
    </FormLayout>
  );
};
