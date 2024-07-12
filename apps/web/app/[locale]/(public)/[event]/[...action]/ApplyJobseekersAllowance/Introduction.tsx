import { getTranslations } from "next-intl/server";
import { postgres, routes, workflow } from "../../../../../utils";
import { revalidatePath } from "next/cache";

export default async (props: {
  userId: string;
  flow: string;
  data: workflow.ApplyJobseekersAllowance;
}) => {
  const t = await getTranslations("ApplyJobseekersAllowanceIntro");

  async function submitAction() {
    "use server";

    const dataToUpdate: workflow.ApplyJobseekersAllowance = {
      ...props.data,
      hasReadIntro: true,
    };

    await postgres.pgpool.query(
      `
          INSERT INTO user_flow_data (user_id, flow, flow_data, category)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (flow, user_id)
          DO UPDATE SET flow_data = $3
          WHERE user_flow_data.user_id=$1 AND user_flow_data.flow=$2
      `,
      [
        props.userId,
        workflow.keys.applyJobseekersAllowance,
        JSON.stringify(dataToUpdate),
        workflow.categories.employment,
      ],
    );

    revalidatePath("/");
  }

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds-from-desktop">
        <div className="govie-heading-l">{t("title")}</div>
        <form action={submitAction}>
          <div className="govie-heading-m">{t("firstSubtitle")}</div>
          <p className="govie-body">{t("paragraph1")}</p>
          <ul
            className="govie-list govie-list--bullet"
            style={{ maxWidth: "100%" }}
          >
            <li>
              <span className="govie-body">{t("firstPoint")}</span>
            </li>
            <li>
              <span className="govie-body">{t("secondPoint")}</span>
            </li>
            <p className="govie-body">or</p>
            <li>
              <span className="govie-body">{t("thirdPoint")}</span>
            </li>
          </ul>
          <p className="govie-body">{t("paragraph2")}</p>
          <div className="govie-heading-m">{t("secondSubtitle")}</div>
          <p className="govie-body">{t("paragraph3")}</p>
          <p className="govie-body">{t("paragraph4")}</p>
          <p className="govie-heading-s">{t("thirdSubtitle")}</p>
          <p className="govie-body">{t("paragraph5")}</p>
          <button type="submit" className="govie-button">
            {t("continue")}
          </button>
        </form>
      </div>
    </div>
  );
};
