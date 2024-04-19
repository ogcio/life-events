import { getTranslations } from "next-intl/server";
import { FormProps } from "./page";
import { form } from "../../../utils";
import { revalidatePath } from "next/cache";
import { redirect } from "../../../utils/navigation";
import { Profile } from "building-blocks-sdk";

export async function ManualAddressForm(props: FormProps) {
  const { userId, firstName, lastName, email } = props.userData;
  const t = await getTranslations("AddressForm");
  const errorT = await getTranslations("FormErrors");
  const errors = await form.getErrorsQuery(userId);

  async function submitAction(formData: FormData) {
    "use server";
    const errors: form.Error[] = [];
    const addressFirst = formData.get("addressFirst")?.toString();
    const addressSecond = formData.get("addressSecond")?.toString();
    const town = formData.get("town")?.toString();
    const county = formData.get("county")?.toString();
    const eirecode = formData.get("eirecode")?.toString();

    if (!addressFirst) {
      errors.push({
        messageKey: form.errorTranslationKeys.empty,
        errorValue: "",
        field: form.fieldTranslationKeys.addressFirstLine,
      });
    }

    if (!town) {
      errors.push({
        messageKey: form.errorTranslationKeys.empty,
        errorValue: "",
        field: form.fieldTranslationKeys.town,
      });
    }

    if (!county) {
      errors.push({
        messageKey: form.errorTranslationKeys.empty,
        errorValue: "",
        field: form.fieldTranslationKeys.county,
      });
    }

    if (!eirecode) {
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

    const userExistsQuery = await new Profile(userId).getUser();

    if (!userExistsQuery.data) {
      new Profile(userId).createUser({
        firstname: firstName,
        lastname: lastName,
        email,
      });
    }

    if (addressFirst && town && county && eirecode) {
      new Profile(userId).createAddress({
        address_line1: addressFirst,
        address_line2: addressSecond,
        town: town,
        county: county,
        eirecode: eirecode,
      });

      redirect("/");
    }
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
    <form action={submitAction}>
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
          <input type="text" id="town" name="town" className="govie-input" />
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
          />
        </div>
      </fieldset>
      <button className="govie-button" style={{ marginBottom: 0 }}>
        {t("continueWithAddress")}
      </button>
    </form>
  );
}
