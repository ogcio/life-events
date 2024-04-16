import { PgSessions } from "auth/sessions";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { form, postgres } from "../../../../utils";
import { NextPageProps } from "../../../../../types";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import dayjs from "dayjs";

async function getAddress(addressId: string) {
  const { userId } = await PgSessions.get();
  const res = await postgres.pgpool.query<{
    address_id: string;
    address_line1: string;
    address_line2: string;
    town: string;
    county: string;
    eirecode: string;
    move_in_date: string;
    move_out_date: string;
  }>(
    `SELECT address_line1, address_line2, town, county, eirecode, move_in_date, move_out_date FROM user_addresses WHERE user_id = $1 AND address_id = $2`,
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
  const moveInDay = formData.get("moveInDay");
  const moveInMonth = formData.get("moveInMonth");
  const moveInYear = formData.get("moveInYear");
  const moveOutDay = formData.get("moveOutDay");
  const moveOutMonth = formData.get("moveOutMonth");
  const moveOutYear = formData.get("moveOutYear");

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

  if (moveInDay || moveInMonth || moveInYear) {
    errors.push(
      ...form.validation.dateErrors(
        {
          field: form.fieldTranslationKeys.moveInYear,
          value: parseInt(moveInYear?.toString() || ""),
        },
        {
          field: form.fieldTranslationKeys.moveInMonth,
          value: parseInt(moveInMonth?.toString() || ""),
        },
        {
          field: form.fieldTranslationKeys.moveInDay,
          value: parseInt(moveInDay?.toString() || ""),
        },
      ),
    );
  }

  if (moveOutDay || moveOutMonth || moveOutYear) {
    errors.push(
      ...form.validation.dateErrors(
        {
          field: form.fieldTranslationKeys.moveOutYear,
          value: parseInt(moveOutYear?.toString() || ""),
        },
        {
          field: form.fieldTranslationKeys.moveOutMonth,
          value: parseInt(moveOutMonth?.toString() || ""),
        },
        {
          field: form.fieldTranslationKeys.moveOutDay,
          value: parseInt(moveOutDay?.toString() || ""),
        },
      ),
    );
  }

  if (errors.length) {
    await form.insertErrors(errors, userId);
    return revalidatePath("/");
  }

  let moveInDate: Date | null = null;
  if (moveInDay && moveInMonth && moveInYear) {
    moveInDate = new Date(
      `${moveInYear?.toString()}-${moveInMonth?.toString()}-${moveInDay?.toString()}`,
    );
  }

  let moveOutDate: Date | null = null;
  if (moveOutDay && moveOutMonth && moveOutYear) {
    moveOutDate = new Date(
      `${moveOutYear?.toString()}-${moveOutMonth?.toString()}-${moveOutDay?.toString()}`,
    );
  }

  await postgres.pgpool.query(
    `
        UPDATE user_addresses
        SET address_line1 = $3, address_line2 = $4, town = $5, county = $6, eirecode = $7, move_in_date = $8, move_out_date = $9, updated_at = now()
        WHERE user_id = $1 AND address_id = $2
    `,
    [
      userId,
      addressId,
      addressFirst,
      addressSecond,
      town,
      county,
      eirecode,
      moveInDate,
      moveOutDate,
    ],
  );
  redirect("/");
}

async function cancelAction() {
  "use server";
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

  const moveInDayError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.moveInDay,
  );
  const moveInMonthError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.moveInMonth,
  );
  const moveInYearError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.moveInYear,
  );

  const moveInDateErrors: form.Error[] = [];
  moveInYearError && moveInDateErrors.push(moveInYearError);
  moveInMonthError && moveInDateErrors.push(moveInMonthError);
  moveInDayError && moveInDateErrors.push(moveInDayError);

  const moveOutDayError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.moveOutDay,
  );
  const moveOutMonthError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.moveOutMonth,
  );
  const moveOutYearError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.moveOutYear,
  );

  const moveOutDateErrors: form.Error[] = [];
  moveOutYearError && moveOutDateErrors.push(moveOutYearError);
  moveOutMonthError && moveOutDateErrors.push(moveOutMonthError);
  moveOutDayError && moveOutDateErrors.push(moveOutDayError);

  const moveInDay = address.move_in_date
    ? dayjs(address.move_in_date).date()
    : "";
  const moveInMonth = address.move_in_date
    ? dayjs(address.move_in_date).month() + 1
    : "";
  const moveInYear = address.move_in_date
    ? dayjs(address.move_in_date).year()
    : "";

  const moveOutDay = address.move_out_date
    ? dayjs(address.move_out_date).date()
    : "";
  const moveOutMonth = address.move_out_date
    ? dayjs(address.move_out_date).month() + 1
    : "";
  const moveOutYear = address.move_out_date
    ? dayjs(address.move_out_date).year()
    : "";

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

            <div
              className={`govie-form-group ${
                Boolean(moveInDateErrors.length)
                  ? "govie-form-group--error"
                  : ""
              }`}
            >
              <h2 className="govie-heading-s" id="moveInDate">
                {t("moveInDate")}
              </h2>
              {Boolean(moveInDateErrors.length) && (
                <p className="govie-error-message">
                  {errorT(moveInDateErrors.at(0)?.messageKey, {
                    field: errorT(`fields.${moveInDateErrors.at(0)?.field}`),
                    indArticleCheck: "",
                  })}
                </p>
              )}

              <div className="govie-date-input" id="example-date">
                <div className="govie-date-input__item">
                  <div className="govie-form-group">
                    <label
                      className="govie-label--s govie-date-input__label"
                      htmlFor="moveInDay"
                    >
                      {t("day")}
                    </label>
                    <input
                      className={`govie-input govie-date-input__input govie-input--width-2 ${
                        moveInDayError ? "govie-input--error" : ""
                      }`.trim()}
                      id="moveInDay"
                      name="moveInDay"
                      type="number"
                      inputMode="numeric"
                      defaultValue={
                        moveInDayError ? moveInDayError.errorValue : moveInDay
                      }
                    />
                  </div>
                </div>
                <div className="govie-date-input__item">
                  <div className="govie-form-group">
                    <label
                      className="govie-label--s govie-date-input__label"
                      htmlFor="moveInMonth"
                    >
                      {t("month")}
                    </label>
                    <input
                      className={`govie-input govie-date-input__input govie-input--width-2 ${
                        moveInMonthError ? "govie-input--error" : ""
                      }`.trim()}
                      id="moveInMonth"
                      name="moveInMonth"
                      type="number"
                      inputMode="numeric"
                      defaultValue={
                        moveInMonthError
                          ? moveInMonthError.errorValue
                          : moveInMonth
                      }
                    />
                  </div>
                </div>
                <div className="govie-date-input__item">
                  <div className="govie-form-group">
                    <label
                      className="govie-label--s govie-date-input__label"
                      htmlFor="moveInYear"
                    >
                      {t("year")}
                    </label>
                    <input
                      className={`govie-input govie-date-input__input govie-input--width-4 ${
                        moveInYearError ? "govie-input--error" : ""
                      }`.trim()}
                      id="moveInYear"
                      name="moveInYear"
                      type="number"
                      inputMode="numeric"
                      defaultValue={
                        moveInYearError
                          ? moveInYearError.errorValue
                          : moveInYear
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`govie-form-group ${
                Boolean(moveOutDateErrors.length)
                  ? "govie-form-group--error"
                  : ""
              }`}
            >
              <h2 className="govie-heading-s" id="moveOutDate">
                {t("moveOutDate")}
              </h2>
              {Boolean(moveOutDateErrors.length) && (
                <p className="govie-error-message">
                  {errorT(moveOutDateErrors.at(0)?.messageKey, {
                    field: errorT(`fields.${moveOutDateErrors.at(0)?.field}`),
                    indArticleCheck: "",
                  })}
                </p>
              )}

              <div className="govie-date-input" id="example-date">
                <div className="govie-date-input__item">
                  <div className="govie-form-group">
                    <label
                      className="govie-label--s govie-date-input__label"
                      htmlFor="moveOutDay"
                    >
                      {t("day")}
                    </label>
                    <input
                      className={`govie-input govie-date-input__input govie-input--width-2 ${
                        moveOutDayError ? "govie-input--error" : ""
                      }`.trim()}
                      id="moveOutDay"
                      name="moveOutDay"
                      type="number"
                      inputMode="numeric"
                      defaultValue={
                        moveOutDayError
                          ? moveOutDayError.errorValue
                          : moveOutDay
                      }
                    />
                  </div>
                </div>
                <div className="govie-date-input__item">
                  <div className="govie-form-group">
                    <label
                      className="govie-label--s govie-date-input__label"
                      htmlFor="moveOutMonth"
                    >
                      {t("month")}
                    </label>
                    <input
                      className={`govie-input govie-date-input__input govie-input--width-2 ${
                        moveOutMonthError ? "govie-input--error" : ""
                      }`.trim()}
                      id="moveOutMonth"
                      name="moveOutMonth"
                      type="number"
                      inputMode="numeric"
                      defaultValue={
                        moveOutMonthError
                          ? moveOutMonthError.errorValue
                          : moveOutMonth
                      }
                    />
                  </div>
                </div>
                <div className="govie-date-input__item">
                  <div className="govie-form-group">
                    <label
                      className="govie-label--s govie-date-input__label"
                      htmlFor="moveOutYear"
                    >
                      {t("year")}
                    </label>
                    <input
                      className={`govie-input govie-date-input__input govie-input--width-4 ${
                        moveOutYearError ? "govie-input--error" : ""
                      }`.trim()}
                      id="moveOutYear"
                      name="moveOutYear"
                      type="number"
                      inputMode="numeric"
                      defaultValue={
                        moveOutYearError
                          ? moveOutYearError.errorValue
                          : moveOutYear
                      }
                    />
                  </div>
                </div>
              </div>
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
              {t("saveChanges")}
            </button>
            <button
              data-module="govie-button"
              className="govie-button govie-button--secondary"
              style={{ marginBottom: 0 }}
              formAction={cancelAction}
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
