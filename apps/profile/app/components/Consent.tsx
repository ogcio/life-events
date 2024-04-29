import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import { Profile } from "building-blocks-sdk";

async function submitAction(formData: FormData) {
  "use server";

  const { firstName, lastName, email, userId } = await PgSessions.get();

  const consentToPrefillData = formData.get("consentToPrefillData");
  const isUserConsenting = consentToPrefillData === "on";

  const { data: userExistsQuery, error } = await new Profile(userId).getUser();

  if (error) {
    //handle error
  }

  if (userExistsQuery) {
    const result = await new Profile(userId).patchUser({
      consentToPrefillData: isUserConsenting,
    });

    if (result?.error) {
      //handle error
    }
  } else {
    const { error } = await new Profile(userId).createUser({
      consentToPrefillData: isUserConsenting,
      firstname: firstName,
      lastname: lastName,
      email,
    });

    if (error) {
      //handle error
    }
  }
}

async function getConsentData() {
  const { userId } = await PgSessions.get();

  const { data, error } = await new Profile(userId).getUser();

  if (error) {
    //handle error
  }

  return {
    consentToPrefillData: data?.consentToPrefillData || false,
  };
}

export default async () => {
  const t = await getTranslations("Consent");

  const { consentToPrefillData } = await getConsentData();

  return (
    <form action={submitAction}>
      <h2 className="govie-heading-m">{t("preFillFormData")}</h2>
      <div className="govie-checkboxes__item" style={{ marginBottom: "30px" }}>
        <input
          className="govie-checkboxes__input"
          id="consent-checkbox"
          name="consentToPrefillData"
          type="checkbox"
          defaultChecked={consentToPrefillData}
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

      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <button
          type="submit"
          data-module="govie-button"
          className="govie-button"
          style={{ marginBottom: 0 }}
        >
          {t("save")}
        </button>
      </div>
    </form>
  );
};
