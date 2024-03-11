import { getTranslations } from "next-intl/server";
import { postgres, web, workflow } from "../../utils";
import { PgSessions } from "auth/sessions";
import { revalidatePath } from "next/cache";
import { RedirectType, redirect } from "next/navigation";

const agreements = {
  storeUserData: "storeUserData",
};

type ConsentState = {
  isInitialized: boolean;
};
const rules: Parameters<typeof workflow.getCurrentStep<ConsentState>>[0] = [
  ({ isInitialized }) => (!isInitialized ? "welcome" : null),
];

export default async (props: web.NextPageProps) => {
  const { userId } = await PgSessions.get();
  const t = await getTranslations("UserConsentFlow");

  const consentsResult = await postgres.pgpool.query(
    `
    SELECT 1 FROM user_consents WHERE user_id = $1
  `,
    [userId]
  );

  const step = workflow.getCurrentStep<ConsentState>(rules, {
    isInitialized: Boolean(consentsResult.rowCount),
  });

  async function consentAction(formData: FormData) {
    "use server";
    const decision = formData.get("identity-selection");
    await postgres.pgpool.query(
      `
      INSERT INTO user_consents(user_id, agreement, is_consenting)
      VALUES($1, $2, $3)
    `,
      [userId, agreements.storeUserData, decision === "agree"]
    );

    revalidatePath("/");
  }

  if (step !== "welcome") {
    return redirect(
      props.searchParams?.redirect_url ?? "/",
      RedirectType.replace
    );
  }

  return (
    <main className="govie-main-wrapper govie-grid-row">
      <div className="govie-grid-column-two-thirds-from-desktop">
        <h1 className="govie-heading-l">{t("title")}</h1>
        <p className="govie-body">{t("disclaimer")}</p>
        <form action={consentAction}>
          <div className="govie-radios govie-radios--large govie-form-group govie-radios--inline">
            <div className="govie-radios__item">
              <input
                id="agree"
                name="identity-selection"
                type="radio"
                value="agree"
                data-aria-controls="conditional-agree"
                className="govie-radios__input"
                defaultChecked
              />
              <label
                className="govie-label--s govie-radios__label"
                htmlFor="agree"
              >
                {t("agree")}
              </label>
            </div>

            <div className="govie-radios__item">
              <input
                id="disagree"
                name="identity-selection"
                type="radio"
                value="disagree"
                data-aria-controls="conditional-disagree"
                className="govie-radios__input"
              />
              <label
                className="govie-label--s govie-radios__label"
                htmlFor="disagree"
              >
                {t("disagree")}
              </label>
            </div>
          </div>
          <button type="submit" className="govie-button">
            {t("submit")}
          </button>
        </form>
        <details className="govie-details govie-!-font-size-16">
          <summary className="govie-details__summary">
            <span className="govie-details__summary-text">
              {t("detailsSummary")}
            </span>
          </summary>

          <div className="govie-details__text">{t("detailsText")}</div>
        </details>
      </div>
    </main>
  );
};
