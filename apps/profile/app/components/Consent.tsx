import { getTranslations } from "next-intl/server";

export default async () => {
  const t = await getTranslations("Consent");
  return (
    <div>
      <h2 className="govie-heading-m">{t("preFillFormData")}</h2>
      <div className="govie-checkboxes__item" style={{ marginBottom: "30px" }}>
        <input
          className="govie-checkboxes__input"
          id="consent-checkbox"
          name="consentFormPrefill"
          type="checkbox"
        />
        <label
          className="govie-label--s govie-checkboxes__label"
          htmlFor="consent-checkbox"
        >
          {t("consentText")}
        </label>
      </div>
      <details className="govie-details govie-!-font-size-16">
        <summary className="govie-details__summary">
          <span className="govie-details__summary-text">{t("dvaTitle")}</span>
        </summary>

        <div className="govie-details__text">{t("dvaText")}</div>
      </details>
    </div>
  );
};
