import { PgSessions } from "auth/sessions";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { form, routes } from "../../../../utils";
import { NextPageProps } from "../../../../../types";
import { revalidatePath } from "next/cache";
import dayjs from "dayjs";
import { Profile } from "building-blocks-sdk";
import Link from "next/link";

async function editAddress(formData: FormData) {
  "use server";

  const addressId = formData.get("addressId")?.toString();
  const userId = formData.get("userId")?.toString();

  if (!addressId) {
    throw Error("Address id not found");
  }

  if (!userId) {
    throw Error("User id not found");
  }

  const errors: form.Error[] = [];
  const addressFirst = formData.get("addressFirst")?.toString();
  const addressSecond = formData.get("addressSecond")?.toString();
  const town = formData.get("town")?.toString();
  const county = formData.get("county")?.toString();
  const eirecode = formData.get("eirecode")?.toString();
  const moveInDay = formData.get("moveInDay")?.toString();
  const moveInMonth = formData.get("moveInMonth")?.toString();
  const moveInYear = formData.get("moveInYear")?.toString();
  const moveOutDay = formData.get("moveOutDay")?.toString();
  const moveOutMonth = formData.get("moveOutMonth")?.toString();
  const moveOutYear = formData.get("moveOutYear")?.toString();

  if (!addressFirst) {
    errors.push({
      messageKey: form.errorTranslationKeys.empty,
      errorValue: "",
      field: form.fieldTranslationKeys.address_first_line,
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

  if (moveInDay || moveInMonth || moveInYear) {
    errors.push(
      ...form.validation.dateErrors(
        {
          field: form.fieldTranslationKeys.moveInYear,
          value: parseInt(moveInYear || ""),
        },
        {
          field: form.fieldTranslationKeys.moveInMonth,
          value: parseInt(moveInMonth || ""),
        },
        {
          field: form.fieldTranslationKeys.moveInDay,
          value: parseInt(moveInDay || ""),
        },
      ),
    );
  }

  if (moveOutDay || moveOutMonth || moveOutYear) {
    errors.push(
      ...form.validation.dateErrors(
        {
          field: form.fieldTranslationKeys.moveOutYear,
          value: parseInt(moveOutYear || ""),
        },
        {
          field: form.fieldTranslationKeys.moveOutMonth,
          value: parseInt(moveOutMonth || ""),
        },
        {
          field: form.fieldTranslationKeys.moveOutDay,
          value: parseInt(moveOutDay || ""),
        },
      ),
    );
  }

  if (errors.length) {
    await form.insertErrors(errors, userId, routes.addresses.editAddress.slug);
    return revalidatePath("/");
  }

  let moveInDate: string | undefined;
  if (moveInDay && moveInMonth && moveInYear) {
    moveInDate = dayjs()
      .year(Number(moveInYear))
      .month(Number(moveInMonth) - 1)
      .date(Number(moveInDay))
      .startOf("day")
      .toISOString();
  }

  let moveOutDate: string | undefined;
  if (moveOutDay && moveOutMonth && moveOutYear) {
    moveOutDate = dayjs()
      .year(Number(moveOutYear))
      .month(Number(moveOutMonth) - 1)
      .date(Number(moveOutDay))
      .startOf("day")
      .toISOString();
  }

  if (addressFirst && town && county && eirecode) {
    const result = await new Profile(userId).updateAddress(addressId, {
      address_line1: addressFirst,
      address_line2: addressSecond,
      town: town,
      county: county,
      eirecode: eirecode,
      move_in_date: moveInDate,
      move_out_date: moveOutDate,
    });

    if (result?.error) {
      //handle error
    }
  }

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
  const errors = await form.getErrorsQuery(
    userId,
    routes.addresses.editAddress.slug,
  );
  const { id: addressId } = params.params;

  if (!addressId) {
    throw notFound();
  }

  const { data: address, error } = await new Profile(userId).getAddress(
    addressId,
  );

  if (!address || error) {
    //handle other errors
    throw notFound();
  }

  const addressFirstLineError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.address_first_line,
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
          <input type="hidden" name="userId" defaultValue={userId} />
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
