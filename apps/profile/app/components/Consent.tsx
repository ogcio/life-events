import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AuthenticationFactory } from "../utils/authentication-factory";

async function submitAction(formData: FormData) {
  "use server";

  const submitAuthContext =
    await AuthenticationFactory.getInstance().getContext();
  const submitProfile = await AuthenticationFactory.getProfileClient();
  const submitUser = await submitProfile.getUser(submitAuthContext.user.id);
  if (!submitUser.data) {
    return notFound();
  }

  const consentToPrefillData = formData.get("consentToPrefillData");
  const isUserConsenting = consentToPrefillData === "on";

  const result = await submitProfile.patchUser(submitAuthContext.user.id, {
    consentToPrefillData: isUserConsenting,
  });

  if (result?.error) {
    //handle error
  }
}

async function getConsentData() {
  const getConsentDataUser =
    await AuthenticationFactory.getInstance().getUser();
  const consentProfile = await AuthenticationFactory.getProfileClient();

  const { data, error } = await consentProfile.getUser(getConsentDataUser.id);

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
