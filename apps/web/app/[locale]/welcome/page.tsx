import { getTranslations } from "next-intl/server";
import { form, postgres, web, workflow } from "../../utils";
import { PgSessions } from "auth/sessions";
import { revalidatePath } from "next/cache";
import { RedirectType, redirect } from "next/navigation";
import storeUserConsent from "../../utils/storeUserConsent";
import { errorTranslationKeys } from "../../utils/form";

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
  const errorT = await getTranslations("formErrors");

  if (publicServant) {
    await storeUserConsent(userId, "agree");
  }

  const consentsResult = await postgres.pgpool.query<{
    is_consenting: boolean;
  }>(`SELECT is_consenting FROM user_consents WHERE user_id = $1`, [userId]);

  const isConsenting = consentsResult.rows[0]?.is_consenting;

  const { key: step } = workflow.getCurrentStep<ConsentState>(rules, {
    isInitialized: isConsenting,
  });

  async function consentAction(formData: FormData) {
    "use server";
    const decision = formData.get("consent");

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

  const isConsentingError =
    consentsResult.rows.length > 0 && !isConsenting
      ? errorTranslationKeys.checkboxRequired
      : null;

  return (
    <main className="govie-main-wrapper govie-grid-row">
      <div className="govie-grid-column-two-thirds-from-desktop">
        <h1 className="govie-heading-l">{t("title")}</h1>
        <p className="govie-body">{t("p1")}</p>
        <p className="govie-body">
          {t.rich("p2", {
            link: (chunks) => (
              <a
                target="_blank"
                href="https://www.gov.ie/en/help/abd3e-privacy-policy-for-the-government-digital-wallet-app/"
              >
                {chunks}
              </a>
            ),
          })}
        </p>

        <form action={consentAction}>
          <div className="govie-form-group">
            <fieldset className="govie-fieldset" aria-describedby="">
              {isConsentingError && (
                <p id="nationality-error" className="govie-error-message">
                  <span className="govie-visually-hidden">Error:</span>{" "}
                  {errorT(isConsentingError)}
                </p>
              )}
              <div
                className="govie-checkboxes govie-checkboxes--small"
                data-module="govie-checkboxes"
              >
                <div className="govie-checkboxes__item">
                  <input
                    className="govie-checkboxes__input"
                    id="consent"
                    name="consent"
                    type="checkbox"
                    value="agree"
                  />
                  <label className="govie-checkboxes__label" htmlFor="consent">
                    {t("checkbox")}
                  </label>
                </div>
              </div>
            </fieldset>
          </div>
          <button type="submit" className="govie-button">
            {t("submit")}
          </button>
        </form>
      </div>
    </main>
  );
};
