import { getTranslations } from "next-intl/server";
import { postgres, web, workflow } from "../../utils";
import { PgSessions } from "auth/sessions";
import { revalidatePath } from "next/cache";
import { RedirectType, redirect } from "next/navigation";
import storeUserConsent from "../../utils/storeUserConsent";

type ConsentState = {
  isInitialized: boolean;
};
const rules: Parameters<typeof workflow.getCurrentStep<ConsentState>>[0] = [
  ({ isInitialized }) =>
    !isInitialized
      ? { key: "welcome", isStepValid: true }
      : { key: null, isStepValid: true },
];

export default async (props: web.NextPageProps) => {
  const { userId, publicServant } = await PgSessions.get();
  const t = await getTranslations("UserConsentFlow");

  if (publicServant) {
    await storeUserConsent(userId, "agree");
  }

  const consentsResult = await postgres.pgpool.query(
    `
    SELECT 1 FROM user_consents WHERE user_id = $1
  `,
    [userId],
  );

  const { key: step } = workflow.getCurrentStep<ConsentState>(rules, {
    isInitialized: Boolean(consentsResult.rowCount),
  });

  async function consentAction(formData: FormData) {
    "use server";
    const decision = formData.get("identity-selection");

    await storeUserConsent(userId, decision as string);

    revalidatePath("/");
  }

  if (step !== "welcome") {
    let redirect_url = props.searchParams?.redirect_url ?? "/";
    let urlError = false;
    try {
      const url = new URL(props.searchParams?.redirect_url || "/");
      if (url?.origin !== process.env.HOST_URL) {
        urlError = true;
      }
    } catch (error) {
      console.error(error);
    }

    if (urlError) {
      throw new Error("Invalid redirect URL");
    }

    return redirect(redirect_url, RedirectType.replace);
  }

  return (
    <main className="govie-main-wrapper govie-grid-row">
      <div className="govie-grid-column-two-thirds-from-desktop">
        <h1 className="govie-heading-l">{t("title")}</h1>
        <p className="govie-body">{t("disclaimer")}</p>
        <p className="govie-body">{t("question")}</p>

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
      </div>
    </main>
  );
};
