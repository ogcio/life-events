import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { postgres, routes, workflow } from "../../../../utils";
import { ListRow } from "../../../[event]/[...action]/shared/SummaryListRow";
import FormLayout from "../../../../components/FormLayout";

type Props = {
  flowData: workflow.ApplyJobseekersAllowance;
  flow: string;
  userId: string;
};

export default async ({ userId, flow, flowData }: Props) => {
  const t = await getTranslations("Admin.ApplyJobseekersAllowanceDetails");
  async function approveAction(formData: FormData) {
    "use server";
    const userId = formData.get("userId");
    const flow = formData.get("flow");

    await postgres.pgpool.query(
      `
            UPDATE user_flow_data set flow_data = flow_data || jsonb_build_object('successfulAt', now()::DATE::TEXT), updated_at = now()
            WHERE user_id=$1 AND flow = $2
        `,
      [userId, flow],
    );

    redirect("/admin");
  }

  async function rejectAction() {
    "use server";

    const url = new URL(
      `${headers().get("x-pathname")}/reject`,
      process.env.HOST_URL,
    ).href;
    redirect(url);
  }

  return (
    <FormLayout
      action={{ slug: "submissions." + flow }}
      backHref={`/${routes.admin.slug}`}
      homeHref={`/${routes.admin.slug}`}
    >
      <div className="govie-heading-l">
        {t("title", { flow: t(flow).toLowerCase() })}
      </div>
      <div className="govie-grid-row">
        <div className="govie-grid-column-two-thirds-from-desktop">
          <dl className="govie-summary-list">
            <ListRow
              item={{
                key: t("userName"),
                value: flowData.userName,
              }}
            />
            <ListRow
              item={{
                key: t("email"),
                value: flowData.email,
              }}
            />
            <ListRow
              item={{
                key: t("contactNumber"),
                value: flowData.contactNumber,
              }}
            />
            <ListRow
              item={{
                key: t("currentAddress"),
                value: flowData.currentAddress,
              }}
            />
          </dl>
        </div>
      </div>

      <form
        action={approveAction}
        style={{ display: "flex", alignItems: "baseline", gap: "20px" }}
      >
        <input type="hidden" name="userId" defaultValue={userId} />
        <input type="hidden" name="flow" defaultValue={flow} />

        <button
          className="govie-button govie-button--tertiary govie-button--medium"
          formAction={rejectAction}
        >
          {t("reject")}
        </button>
        <button type="submit" className="govie-button govie-button--medium">
          {t("approve")}
        </button>
      </form>
    </FormLayout>
  );
};
