import Link from "next/link";
import { redirect } from "next/navigation";
import { form, postgres, routes, web, workflow } from "../../../../utils";
import FormLayout from "../../../../components/FormLayout";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import dayjs from "dayjs";
import { getDigitalWalletAdminRules } from "./GetDigitalWalletDetails";

type Props = {
  flow: string;
  userId: string;
  flowData: workflow.GetDigitalWallet;
};

export default async (props: Props) => {
  const t = await getTranslations("Admin.RejectReasonForm");
  const errorT = await getTranslations("formErrors");
  const { userId, flow, flowData } = props;
  const basePath =
    headers().get("x-pathname")?.split("/reject")[0] ??
    `${routes.admin.slug}/${flow}/${userId}`;

  async function rejectAction(formData: FormData) {
    "use server";
    const formErrors: form.Error[] = [];

    const nextStep = formData.get("nextStep")?.toString();

    if (!nextStep) {
      throw new Error("Missing next workflow step");
    }

    const reason = formData.get("rejectReason")?.toString();
    formErrors.push(
      ...form.validation.stringNotEmpty(
        form.fieldTranslationKeys.reason,
        reason,
      ),
    );

    if (formErrors.length) {
      await form.insertErrors(formErrors, userId, basePath, flow);

      return revalidatePath("/");
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

    const totalApprovalStages = Object.keys(
      workflow.workFlowApprovalStages[flow],
    ).length;
    const currentStage = currentFlowData.approvalStages.length;
    const newStage = currentFlowData.approvalStages.length + 1;

    let dataToUpdate: workflow.GetDigitalWallet;
    if (currentStage < totalApprovalStages) {
      const date = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss.SSSSSSZ");

      const approvalStages: workflow.GetDigitalWallet["approvalStages"] = [
        ...currentFlowData.approvalStages,
        {
          stageNumber: newStage,
          stageKey: nextStep,
          status: "rejected",
          rejectReason: reason,
          reviewer: reviewerName,
          date,
        },
      ];

      Object.assign(currentFlowData, {
        approvalStages: approvalStages,
        rejectedAt: date,
        rejectReason: reason,
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
        throw new Error("Could not reject workflow stage");
      }

      redirect("/admin");
    }
  }

  const errors = await form.getErrorsQuery(props.userId, basePath, props.flow);

  const reasonError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.reason,
  );

  const { key: nextStep } = workflow.getCurrentStep(
    getDigitalWalletAdminRules,
    flowData,
  );

  return (
    <FormLayout
      action={{
        slug: "submissions." + props.flow,
        href: basePath,
      }}
      step={"reject"}
      backHref={basePath ?? `/${routes.admin.slug}`}
      homeHref={`/${routes.admin.slug}`}
    >
      <form action={rejectAction}>
        <h1 className="govie-heading-s">{t("title")}</h1>
        <input
          type="hidden"
          name="nextStep"
          defaultValue={nextStep || undefined}
        />
        <div
          className={`govie-form-group ${
            reasonError ? "govie-form-group--error" : ""
          }`.trim()}
        >
          <h1 className="govie-label-wrapper">
            <label
              htmlFor="default-textarea"
              className="govie-label--s govie-label--l"
            >
              {t("inputLabel")}
            </label>
          </h1>
          {reasonError && (
            <p id="input-field-error" className="govie-error-message">
              <span className="govie-visually-hidden">Error:</span>
              {errorT(reasonError.messageKey, {
                field: errorT(`fields.${reasonError.field}`),
                indArticleCheck: "",
              })}
            </p>
          )}
          <textarea
            name="rejectReason"
            className={`govie-textarea ${
              reasonError ? "govie-input--error" : ""
            }`.trim()}
            rows={5}
          ></textarea>
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          <Link
            className="govie-button govie-button--medium govie-button--outlined"
            href={new URL("/admin/submissions", process.env.HOST_URL).href}
          >
            {t("cancel")}
          </Link>
          <button type="submit" className="govie-button govie-button--medium ">
            {t("submit")}
          </button>
        </div>
      </form>
    </FormLayout>
  );
};
