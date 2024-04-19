import { getTranslations } from "next-intl/server";
import { FormProps } from "./page";
import { form, postgres } from "../../../utils";
import { revalidatePath } from "next/cache";
import { Link, redirect } from "../../../utils/navigation";
import { Profile } from "building-blocks-sdk";
import dayjs from "dayjs";

export async function SelectForm(props: FormProps) {
  const t = await getTranslations("AddressForm");
  const errorT = await getTranslations("FormErrors");
  const { userId, firstName, lastName, email } = props.userData;

  async function submitAction(formData: FormData) {
    "use server";

    const errors: form.Error[] = [];
    const selectedAddress = formData.get("address");
    const moveInDay = formData.get("moveInDay");
    const moveInMonth = formData.get("moveInMonth");
    const moveInYear = formData.get("moveInYear");
    const moveOutDay = formData.get("moveOutDay");
    const moveOutMonth = formData.get("moveOutMonth");
    const moveOutYear = formData.get("moveOutYear");

    if (!selectedAddress) {
      errors.push({
        messageKey: form.errorTranslationKeys.empty,
        errorValue: "",
        field: form.fieldTranslationKeys.address,
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

    const userExistsQuery = await postgres.pgpool.query(
      `
            SELECT 1
            FROM user_details
            WHERE user_id = $1
            `,
      [userId],
    );

    if (!userExistsQuery.rows.length) {
      await postgres.pgpool.query(
        `
                    INSERT INTO user_details (user_id, firstname, lastname, email)
                    VALUES ($1, $2, $3, $4)
                  `,
        [userId, firstName, lastName, email],
      );
    }

    if (selectedAddress) {
      const [addressFirst, town, county, eirecode] = selectedAddress
        .toString()
        .split(",");

      new Profile(userId).createAddress({
        address_line1: addressFirst.trim(),
        town: town.trim(),
        county: county.trim(),
        eirecode: eirecode.trim(),
        move_in_date: moveInDate?.toString(),
        move_out_date: moveOutDate?.toString(),
      });
    }

    redirect("/");
  }

  const urlParams = new URLSearchParams({ q: props.addressQuery });

  const addressResponse = await fetch(
    `${process.env.API_ENDPOINT}/static/addresses/api?${urlParams}`,
  );
  const addresses = await addressResponse.json();

  const options = addresses.map((addr: string) => (
    <option key={addr}>{addr}</option>
  ));

  const errors = await form.getErrorsQuery(userId);

  const addressError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.address,
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

  return (
    <>
      <form action={submitAction}>
        <div
          className={`govie-form-group ${
            addressError ? "govie-form-group--error" : ""
          }`.trim()}
        >
          <label className="govie-hint" id="input-field-hint">
            {t("selectHint")}
          </label>
          {addressError && (
            <p id="input-field-error" className="govie-error-message">
              <span className="govie-visually-hidden">{t("error")}:</span>
              {errorT(addressError.messageKey, {
                field: errorT("fields.address"),
                indArticleCheck: "an",
              })}
            </p>
          )}
          <select className="govie-select" id={"address"} name={"address"}>
            {options}
          </select>
        </div>
        <div
          className={`govie-form-group ${
            Boolean(moveInDateErrors.length) ? "govie-form-group--error" : ""
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
                  type="text"
                  inputMode="numeric"
                  defaultValue={moveInDayError ? moveInDayError.errorValue : ""}
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
                  type="text"
                  inputMode="numeric"
                  defaultValue={
                    moveInMonthError ? moveInMonthError.errorValue : ""
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
                  type="text"
                  inputMode="numeric"
                  defaultValue={
                    moveInYearError ? moveInYearError.errorValue : ""
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <div
          className={`govie-form-group ${
            Boolean(moveOutDateErrors.length) ? "govie-form-group--error" : ""
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
                  type="text"
                  inputMode="numeric"
                  defaultValue={
                    moveOutDayError ? moveOutDayError.errorValue : ""
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
                  type="text"
                  inputMode="numeric"
                  defaultValue={
                    moveOutMonthError ? moveOutMonthError.errorValue : ""
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
                  type="text"
                  inputMode="numeric"
                  defaultValue={
                    moveOutYearError ? moveOutYearError.errorValue : ""
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <button className="govie-button">{t("continueWithAddress")}</button>
      </form>
      <Link className="govie-link" href={"?t=manual"}>
        {t("notListedTextLink")}
      </Link>
    </>
  );
}
