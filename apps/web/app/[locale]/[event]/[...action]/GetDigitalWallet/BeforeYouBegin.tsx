import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { postgres, workflow } from "../../../../utils";

export default async (props: {
  userId: string;
  flow: string;
  data: workflow.GetDigitalWallet;
}) => {
  const t = await getTranslations("GetDigitalWallet.BeforeYouBeginForm");
  async function submitAction() {
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
  }

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds-from-desktop">
        <div className="govie-heading-l">{t("title")}</div>
        <p className="govie-heading-s">{t("subTitle")}</p>
        <form action={submitAction}>
          <ul
            className="govie-list govie-list--bullet"
            style={{ marginBottom: "30px" }}
          >
            <li>
              <p style={{ fontWeight: "bold" }}>{t("myGovIdEmailAddress")}</p>
            </li>
            <li>
              <p style={{ fontWeight: "bold" }}>{t("govIEEmaildAddress")}</p>
            </li>
            <li>
              <p style={{ marginBottom: "5px", fontWeight: "bold" }}>
                {t("appStoreEmailAddress")}
              </p>
              <p style={{ marginTop: 0 }}>You can find this by going...</p>
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
