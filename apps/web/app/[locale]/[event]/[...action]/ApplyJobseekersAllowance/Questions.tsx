import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { postgres } from "../../../../utils";

export default async (props: { userId: string; flow: string }) => {
  const t = await getTranslations("ApplyJobseekersAllowanceQuestions");
  const questionsT = await getTranslations(
    "ApplyJobseekersAllowanceQuestions.questions",
  );

  async function submitAction() {
    "use server";

    await postgres.pgpool.query(
      `
          UPDATE user_flow_data SET flow_data = flow_data || jsonb_build_object('hasAcceptedQuestions', true)
          WHERE user_id = $1 AND flow = $2
      `,
      [props.userId, props.flow],
    );
    revalidatePath("/");
  }

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds-from-desktop">
        <h1 className="govie-heading-l">{t("title")}</h1>
        <ul
          className="govie-list govie-list--bullet"
          style={{ maxWidth: "100%" }}
        >
          {Array.from({ length: 6 }).map((_, index) => {
            if (index % 2 === 0 && index < 6 - 1) {
              return (
                <li>
                  <p
                    className="govie-heading-s"
                    style={{ marginBottom: "5px", fontWeight: "bold" }}
                  >
                    {questionsT(`${index}`)}
                  </p>
                  <p className="govie-body-s" style={{ marginTop: 0 }}>
                    {questionsT(`${index + 1}`)}
                  </p>
                </li>
              );
            }
            return null;
          })}
        </ul>
        <form action={submitAction}>
          <button type="submit" className="govie-button">
            {t("continue")}
          </button>
        </form>
      </div>
    </div>
  );
};
