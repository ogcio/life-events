import { PgSessions } from "auth/sessions";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { form, postgres } from "../../../../utils";
import { NextPageProps } from "../../../../../types";
import { revalidatePath } from "next/cache";
import Link from "next/link";

async function getAddress(addressId: string) {
  const { userId } = await PgSessions.get();
  const res = await postgres.pgpool.query<{
    address_id: string;
    address_line1: string;
    address_line2: string;
    town: string;
    county: string;
    eirecode: string;
  }>(
    `SELECT address_line1, address_line2, town, county, eirecode FROM user_addresses WHERE user_id = $1 AND address_id = $2`,
    [userId, addressId],
  );

  return res.rows[0];
}

async function editAddress(formData: FormData) {
  "use server";

  const { userId } = await PgSessions.get();

  const addressId = formData.get("addressId")?.toString();

  if (!addressId) {
    throw Error("Address id not found");
  }

  const errors: form.Error[] = [];
  const addressFirst = formData.get("addressFirst");
  const addressSecond = formData.get("addressSecond");
  const town = formData.get("town");
  const county = formData.get("county");
  const eirecode = formData.get("eirecode");

  if (!addressFirst?.toString().length) {
    errors.push({
      messageKey: form.errorTranslationKeys.empty,
      errorValue: "",
      field: form.fieldTranslationKeys.addressFirstLine,
    });
  }

  if (!town?.toString()) {
    errors.push({
      messageKey: form.errorTranslationKeys.empty,
      errorValue: "",
      field: form.fieldTranslationKeys.town,
    });
  }

  if (!county?.toString()) {
    errors.push({
      messageKey: form.errorTranslationKeys.empty,
      errorValue: "",
      field: form.fieldTranslationKeys.county,
    });
  }

  if (!eirecode?.toString()) {
    errors.push({
      messageKey: form.errorTranslationKeys.empty,
      errorValue: "",
      field: form.fieldTranslationKeys.eirecode,
    });
  }

  if (errors.length) {
    await form.insertErrors(errors, userId);
    return revalidatePath("/");
  }

  await postgres.pgpool.query(
    `
        UPDATE user_addresses
        SET address_line1 = $3, address_line2 = $4, town = $5, county = $6, eirecode = $7, updated_at = now()
        WHERE user_id = $1 AND address_id = $2
    `,
    [userId, addressId, addressFirst, addressSecond, town, county, eirecode],
  );
  redirect("/");
}

export default async (params: NextPageProps) => {
  const { userId } = await PgSessions.get();
  const t = await getTranslations("AddressForm");
  const errorT = await getTranslations("FormErrors");
  const errors = await form.getErrorsQuery(userId);
  const { id: addressId } = params.params;

  if (!addressId) {
    throw notFound();
  }

  const address = await getAddress(addressId);

  if (!address) {
    throw notFound();
  }

  const addressFirstLineError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.addressFirstLine,
  );

  const townError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.town,
  );
  const countyError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.county,
  );
  const eireError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.eirecode,
  );

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds">
        <form action={editAddress}>
          <input type="hidden" name="addressId" defaultValue={addressId} />
          <h1 className="govie-heading-l">{t("editAddress")}</h1>
          <fieldset className="govie-fieldset">
            <div
              className={`govie-form-group ${
                addressFirstLineError ? "govie-form-group--error" : ""
              }`.trim()}
            >
              {addressFirstLineError && (
                <p id="input-field-error" className="govie-error-message">
                  <span className="govie-visually-hidden">{t("error")}:</span>
                  {errorT(addressFirstLineError.messageKey, {
                    field: errorT("fields.addressFirstLine"),
                    indArticleCheck: "an",
                  })}
                </p>
              )}
              <label htmlFor="addressFirst" className="govie-label--s">
                {t("firstLineOfAddress")}
              </label>
              <input
                type="text"
                id="addressFirst"
                name="addressFirst"
                className="govie-input"
                defaultValue={address.address_line1}
              />
            </div>

            <div className="govie-form-group">
              <label htmlFor="addressFirst" className="govie-label--s">
                {t("secondLineOfAddress")}
              </label>
              <input
                type="text"
                id="addressSecond"
                name="addressSecond"
                className="govie-input"
                defaultValue={address.address_line2}
              />
            </div>

            <div
              className={`govie-form-group ${
                townError ? "govie-form-group--error" : ""
              }`.trim()}
            >
              {townError && (
                <p id="input-field-error" className="govie-error-message">
                  <span className="govie-visually-hidden">{t("error")}:</span>
                  {errorT(townError.messageKey, {
                    field: errorT("fields.town"),
                    indArticleCheck: "",
                  })}
                </p>
              )}
              <label htmlFor="town" className="govie-label--s">
                {t("town")}
              </label>
              <input
                type="text"
                id="town"
                name="town"
                className="govie-input"
                defaultValue={address.town}
              />
            </div>

            <div
              className={`govie-form-group ${
                countyError ? "govie-form-group--error" : ""
              }`.trim()}
            >
              {countyError && (
                <p id="input-field-error" className="govie-error-message">
                  <span className="govie-visually-hidden">{t("error")}:</span>
                  {errorT(countyError.messageKey, {
                    field: errorT("fields.county"),
                    indArticleCheck: "",
                  })}
                </p>
              )}
              <label htmlFor="county" className="govie-label--s">
                {t("county")}
              </label>
              <input
                type="text"
                id="county"
                name="county"
                className="govie-input"
                defaultValue={address.county}
              />
            </div>

            <div
              className={`govie-form-group ${
                eireError ? "govie-form-group--error" : ""
              }`.trim()}
            >
              {eireError && (
                <p id="input-field-error" className="govie-error-message">
                  <span className="govie-visually-hidden">{t("error")}:</span>
                  {errorT(eireError.messageKey, {
                    field: errorT("fields.eirecode"),
                    indArticleCheck: "an",
                  })}
                </p>
              )}
              <label htmlFor="eirecode" className="govie-label--s">
                {t("eirecode")}
              </label>
              <input
                type="text"
                id="eirecode"
                name="eirecode"
                className="govie-input"
                defaultValue={address.eirecode}
              />
            </div>
          </fieldset>
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
            <button
              type="button"
              data-module="govie-button"
              className="govie-button govie-button--secondary"
              style={{ marginBottom: 0 }}
            >
              {t("cancel")}
            </button>
          </div>
        </form>
        <div style={{ margin: "30px 0" }}>
          <Link href={"/"} className="govie-back-link">
            {t("back")}
          </Link>
        </div>
      </div>
    </div>
  );
};
