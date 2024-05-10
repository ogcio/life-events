import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { postgres, routes, workflow } from "../../../../utils";
import { ListRow } from "../../../[event]/[...action]/shared/SummaryListRow";
import FormLayout from "../../../../components/FormLayout";
import dayjs from "dayjs";
import { PgSessions } from "auth/sessions";

export const getDigitalWalletAdminRules: Parameters<
  typeof workflow.getCurrentStep<workflow.GetDigitalWallet>
>[0] = [
  // Rule 1: Check if OGCIO approved (user is public servant) - stage 0
  ({ approvalStages }) => {
    const stageKey = Object.keys(
      workflow.workFlowApprovalStages[workflow.keys.getDigitalWallet],
    )[0];
    return !approvalStages.find((stage) => stage.stageKey === stageKey)
      ? {
          key: stageKey,
          isStepValid: true,
        }
      : {
          key: null,
          isStepValid: true,
        };
  },
  //Rule 2: Check if user has access to digital wallet pilot - stage 1
  ({ approvalStages }) => {
    const stageKey = Object.keys(
      workflow.workFlowApprovalStages[workflow.keys.getDigitalWallet],
    )[1];
    return !approvalStages.find((stage) => stage.stageKey === stageKey)
      ? {
          key: stageKey,
          isStepValid: true,
        }
      : {
          key: null,
          isStepValid: true,
        };
  },
];

const IsPublicServant = () => {
  return (
    <div>
      <h2 className="govie-heading-m">Digital Wallet pilot access</h2>
      <p className="govie-body">
        Click approve to{" "}
        <strong>confirm that this applicant is a public servant</strong> who can
        legitimately apply to the digital wallet pilot.
      </p>
    </div>
  );
};

const DigitalWalletAccess = () => {
  return (
    <div>
      <h2 className="govie-heading-m">Digital Wallet pilot access</h2>
      <p className="govie-body">
        Click approve to{" "}
        <strong>grant this applicant access to the pilot</strong>, or reject to
        reject their application.
      </p>
    </div>
  );
};

const FormComponentsMap = {
  isPublicServant: IsPublicServant,
  digitalWalletAccess: DigitalWalletAccess,
};

type Props = {
  flowData: workflow.GetDigitalWallet;
  flow: string;
  userId: string;
  action: string;
  status: string;
};

export default async ({ userId, flow, flowData, action, status }: Props) => {
  const t = await getTranslations("Admin.GetDigitalWalletDetails");

  const totalApprovalStages = Object.keys(
    workflow.workFlowApprovalStages[flow],
  ).length;

  async function approveAction(formData: FormData) {
    "use server";

    const nextStep = formData.get("nextStep")?.toString();

    if (!nextStep) {
      throw new Error("Missing next workflow step");
    }

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
    const isLastStage = newStage === totalApprovalStages;

    let dataToUpdate: workflow.GetDigitalWallet;
    if (currentStage < totalApprovalStages) {
      const date = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss.SSSSSSZ");

      const approvalStages: workflow.GetDigitalWallet["approvalStages"] = [
        ...currentFlowData.approvalStages,
        {
          stageNumber: newStage,
          stageKey: nextStep,
          status: "approved",
          reviewer: reviewerName,
          date,
        },
      ];
      Object.assign(currentFlowData, {
        approvalStages: approvalStages,
        successfulAt: isLastStage ? date : "",
      });
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

  /* This could be determined by user permissions directly, 
    did not want to simply use the action type - view or review - given it can be 
    modified manually in the url
  */
  const canBeReviewed =
    flowData.approvalStages.length < totalApprovalStages &&
    !flowData.approvalStages.find((obj) => obj.status === "rejected") &&
    action === "review";

  const { key: nextStep } = workflow.getCurrentStep(
    getDigitalWalletAdminRules,
    flowData,
  );

  const StepComponent = nextStep ? FormComponentsMap[nextStep] : null;

  return (
    <FormLayout
      action={{ slug: "submissions." + flow }}
      backHref={`/${routes.admin.submissions.path()}?status=${status}`}
      homeHref={`/${routes.admin.submissions.path()}`}
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
          {canBeReviewed && StepComponent && (
            <form action={approveAction}>
              <input
                type="hidden"
                name="nextStep"
                defaultValue={nextStep || undefined}
              />
              <StepComponent />
              <div
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
              </div>
            </form>
          )}
        </div>
      </div>
      {!canBeReviewed && (
        <div className="govie-grid-row">
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
                <th scope="col" className="govie-table__header">
                  {t("step")}
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
                    <td className="govie-table__cell">{obj.stageKey}</td>
                    <td className="govie-table__cell">{`${obj.stageNumber} ${t("of")} ${totalApprovalStages}`}</td>
                    <td className="govie-table__cell">{obj.rejectReason}</td>
                  </tr>
                ))
              ) : (
                <>
                  {Object.keys(
                    workflow.workFlowApprovalStages[
                      workflow.keys.getDigitalWallet
                    ],
                  ).map((stageKey, index) => {
                    return (
                      <tr className="govie-table__row">
                        <th className="govie-table__header" scope="row">
                          <strong className="govie-tag govie-tag--yellow">
                            {t("pending")}
                          </strong>
                        </th>
                        <td className="govie-table__cell"></td>
                        <td className="govie-table__cell"></td>
                        <td className="govie-table__cell">{stageKey}</td>
                        <td className="govie-table__cell">{`${index + 1} ${t("of")} ${totalApprovalStages}`}</td>
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
      )}
    </FormLayout>
  );
};
