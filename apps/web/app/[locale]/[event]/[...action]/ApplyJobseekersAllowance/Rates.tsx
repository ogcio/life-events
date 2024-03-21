import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { postgres, form } from "../../../../utils";

export default async (props: {
  userId: string;
  flow: string;
  slug: string;
}) => {
  const t = await getTranslations("ApplyJobseekersAllowanceRates");
  const ratesT = await getTranslations("ApplyJobseekersAllowanceRates.rates");

  async function submitAction() {
    "use server";

    await postgres.pgpool.query(
      `
          UPDATE user_flow_data SET flow_data = flow_data || jsonb_build_object('hasReadRates', true)
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
        <form action={submitAction}>
          <p className="govie-body">{t("firstParagraph")}</p>
          <p className="govie-body">{t("secondParagraph")}</p>
          <h2 className="govie-heading-m">{t("subtitle")}</h2>
          <dl className="govie-summary-list">
            {Array.from({ length: 18 }).map((_, index) => {
              if (index % 2 === 0 && index < 18 - 1) {
                return (
                  <div
                    className="govie-summary-list__row"
                    key={`${index} - ${index + 1}`}
                  >
                    <dt
                      className="govie-summary-list__key"
                      style={{ width: "50%", fontWeight: "normal" }}
                    >
                      {ratesT.rich(`${index}`, {
                        bold: (chunks) => <strong>{chunks}</strong>,
                      })}
                    </dt>
                    <dd className="govie-summary-list__value">
                      {ratesT.rich(`${index + 1}`, {
                        bold: (chunks) => <strong>{chunks}</strong>,
                      })}
                    </dd>
                  </div>
                );
              }
              return null;
            })}
          </dl>
          <button type="submit" className="govie-button">
            {t("continue")}
          </button>
        </form>
      </div>
    </div>
  );
};
