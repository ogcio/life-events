import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { postgres, workflow } from "../../../../utils";
import { PgSessions } from "auth/sessions";
import authenticatedAction from "../../../../utils/authenticatedAction";

export default async (props: {
  userId: string;
  flow: string;
  data: workflow.GetDigitalWallet;
}) => {
  const t = await getTranslations("GetDigitalWallet.BeforeYouStartForm");

  const submitAction = authenticatedAction(async () => {
    "use server";

    const dataToUpdate: workflow.GetDigitalWallet = {
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
        workflow.keys.getDigitalWallet,
        JSON.stringify(dataToUpdate),
        workflow.categories.digitalWallet,
      ],
    );

    revalidatePath("/");
  });

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds-from-desktop">
        <div className="govie-heading-l">{t("title")}</div>
        <p className="govie-body">{t("paragraph1")}</p>
        <p className="govie-body">{t("paragraph2")}</p>

        <p className="govie-heading-s">{t("paragraph3")}</p>
        <form action={submitAction}>
          <ul
            className="govie-list govie-list--bullet"
            style={{ marginBottom: "30px" }}
          >
            <li>
              <p style={{ fontWeight: "bold" }}>{t("listItem1")}</p>
            </li>
            <li>
              <p style={{ fontWeight: "bold" }}>{t("listItem2")}</p>
            </li>
          </ul>
          <button type="submit" className="govie-button">
            {t("continue")}
          </button>
        </form>
      </div>
    </div>
  );
};
