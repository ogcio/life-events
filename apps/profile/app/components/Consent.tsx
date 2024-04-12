import { getTranslations } from "next-intl/server";
import { postgres } from "../utils";
import { PgSessions } from "auth/sessions";

async function submitAction(formData: FormData) {
  "use server";

  const { firstName, lastName, email, userId } = await PgSessions.get();

  const consentToPrefillData = formData.get("consentToPrefillData");
  const isUserConsenting = consentToPrefillData === "on";

  const userExistsQuery = await postgres.pgpool.query(
    `
    SELECT 1
    FROM user_details
    WHERE user_id = $1
    `,
    [userId],
  );

  if (userExistsQuery.rows.length > 0) {
    await postgres.pgpool.query(
      `
          UPDATE user_details
          SET consent_to_prefill_data = $1
          WHERE user_id = $2
        `,
      [isUserConsenting, userId],
    );
  } else {
    await postgres.pgpool.query(
      `
          INSERT INTO user_details (user_id, consent_to_prefill_data, firstname, lastname, email)
          VALUES ($1, $2, $3, $4, $5)
        `,
      [userId, isUserConsenting, firstName, lastName, email],
    );
  }
}

async function getConsentData() {
  const { userId } = await PgSessions.get();

  const res = await postgres.pgpool.query<{
    consent_to_prefill_data: boolean;
  }>(`SELECT consent_to_prefill_data FROM user_details WHERE user_id = $1`, [
    userId,
  ]);

  const { consent_to_prefill_data } = res.rows[0] || {};

  return {
    consentToPrefillData: consent_to_prefill_data || false,
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
