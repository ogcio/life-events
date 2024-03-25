import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { postgres, form } from "../../../../utils";

export default async (props: { userId: string; flow: string }) => {
  const t = await getTranslations("ApplyJobseekersAllowanceRates");
  const ratesT = await getTranslations("ApplyJobseekersAllowanceRates.rates");

  const rates = [
    "title",
    "fullPaymentOver25",
    "paymentUnder25",
    "extraPaymentOver25",
    "extraPaymentUnder25",
    "extraPaymentChildOver12Full",
    "extraPaymentChildOver12Half",
    "extraPaymentChildUnder12Full",
    "extraPaymentChildUnder12Half",
  ];

  async function submitAction() {
    "use server";

    await postgres.pgpool.query(
      `
          UPDATE user_flow_data SET flow_data = flow_data || jsonb_build_object('hasReadRates', true), updated_at = now()
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
            {rates.map((rate) => (
              <div className="govie-summary-list__row" key={rate}>
                <dt
                  className="govie-summary-list__key"
                  style={{ width: "50%", fontWeight: "normal" }}
                >
                  {ratesT.rich(`${rate}.key`, {
                    bold: (chunks) => <strong>{chunks}</strong>,
                  })}
                </dt>
                <dd className="govie-summary-list__value">
                  {ratesT.rich(`${rate}.value`, {
                    bold: (chunks) => <strong>{chunks}</strong>,
                  })}
                </dd>
              </div>
            ))}
          </dl>
          <button type="submit" className="govie-button">
            {t("continue")}
          </button>
        </form>
      </div>
    </div>
  );
};
