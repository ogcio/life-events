import { getTranslations } from "next-intl/server";
import { postgres } from "../../../../utils";
import { revalidatePath } from "next/cache";

export default async (props: { userId: string; flow: string }) => {
  const t = await getTranslations(
    "ApplyJobseekersAllowanceBenefitsEntitlements",
  );
  async function submitAction() {
    "use server";

    await postgres.pgpool.query(
      `
          UPDATE user_flow_data SET flow_data = flow_data || jsonb_build_object('hasCheckedBenefits', true)
          WHERE user_id = $1 AND flow = $2
      `,
      [props.userId, props.flow],
    );
    revalidatePath("/");
  }

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds-from-desktop">
        <div className="govie-heading-l">{t("title")}</div>
        <p className="govie-body" style={{ marginBottom: 0 }}>
          {t("paragraph1")}
        </p>
        <p className="govie-body">{t("paragraph2")}</p>
        <form action={submitAction}>
          <button className="govie-button">{t("continue")}</button>
        </form>
      </div>
    </div>
  );
};
