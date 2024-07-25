import { getTranslations } from "next-intl/server";
import { form, routes } from "../../../utils";
import { revalidatePath } from "next/cache";
import dayjs from "dayjs";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { NextPageProps } from "../../../../types";
import { AuthenticationFactory } from "../../../utils/authentication-factory";

export default async (props: NextPageProps) => {
  const mainAuthContext =
    await AuthenticationFactory.getInstance().getContext();
  const mainProfile = await AuthenticationFactory.getProfileClient({
    token: mainAuthContext.accessToken,
  });
  const mainUser = await mainProfile.getUser();
  if (!mainUser.data) {
    return notFound();
  }
  const t = await getTranslations("AddressForm");
  const errorT = await getTranslations("FormErrors");
  const { locale } = props.params;

  const errors = await form.getErrorsQuery(
    mainAuthContext.user.id,
    routes.addresses.manualAddress.slug,
  );

  const addressLine1Error = errors.rows.find(
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

  async function createAddress(formData: FormData) {
    "use server";

    const errors: form.Error[] = [];
    const userId = formData.get("userId")?.toString();
    const firstname = formData.get("firstname")?.toString();
    const lastname = formData.get("lastname")?.toString();
    const email = formData.get("email")?.toString();

    if (!userId || !firstname || !lastname || !email) {
      throw Error("Missing user data");
    }

    const addressLine1 = formData.get("addressLine1")?.toString();
    const addressLine2 = formData.get("addressLine2")?.toString();
    const town = formData.get("town")?.toString();
    const county = formData.get("county")?.toString();
    const eirecode = formData.get("eirecode")?.toString();
    const moveInDay = formData.get("moveInDay");
    const moveInMonth = formData.get("moveInMonth");
    const moveInYear = formData.get("moveInYear");
    const moveOutDay = formData.get("moveOutDay");
    const moveOutMonth = formData.get("moveOutMonth");
    const moveOutYear = formData.get("moveOutYear");

    if (!addressLine1) {
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
      await form.insertErrors(
        errors,
        userId,
        routes.addresses.manualAddress.slug,
      );
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

    const createProfile = await AuthenticationFactory.getProfileClient();

    const { data: userExistsQuery, error } = await createProfile.getUser();

    if (error) {
      //handle error
    }

    if (!userExistsQuery) {
      const { error } = await createProfile.createUser({
        firstname,
        lastname,
        email,
        preferredLanguage: locale,
      });

      if (error) {
        //handle error
      }
    }

    if (addressLine1 && town && county && eirecode) {
      const { data, error } = await createProfile.createAddress({
        addressLine1,
        addressLine2,
        town,
        county,
        eirecode,
        moveInDate,
        moveOutDate,
      });

      if (error) {
        //handle error
      }

      if (data) {
        redirect(`/${locale}/${routes.addresses.addDetails.path(data.id)}`);
      } else {
        redirect(`/${locale}`);
      }
    }
  }

  async function cancelAction() {
    "use server";
    redirect(`/${locale}`);
  }

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds">
        <h1 className="govie-heading-l">{t("newAddress")}</h1>
        <form action={createAddress}>
          <input
            type="hidden"
            name="userId"
            defaultValue={mainAuthContext.user.id}
          />
          <input
            type="hidden"
            name="firstname"
            defaultValue={mainUser.data.firstName}
          />
          <input
            type="hidden"
            name="lastname"
            defaultValue={mainUser.data.lastName}
          />
          <input
            type="hidden"
            name="email"
            defaultValue={mainUser.data.email}
          />
          <div
            className={`govie-form-group ${
              addressLine1Error ? "govie-form-group--error" : ""
            }`.trim()}
          >
            {addressLine1Error && (
              <p id="input-field-error" className="govie-error-message">
                <span className="govie-visually-hidden">{t("error")}:</span>
                {errorT(addressLine1Error.messageKey, {
                  field: errorT("fields.addressLine1Line"),
                  indArticleCheck: "an",
                })}
              </p>
            )}
            <label htmlFor="addressLine1" className="govie-label--s">
              {t("firstLineOfAddress")}
            </label>
            <input
              type="text"
              id="addressLine1"
              name="addressLine1"
              className="govie-input"
            />
          </div>

          <div className="govie-form-group">
            <label htmlFor="addressLine1" className="govie-label--s">
              {t("secondLineOfAddress")}
            </label>
            <input
              type="text"
              id="addressLine2"
              name="addressLine2"
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
                    defaultValue={
                      moveInDayError ? moveInDayError.errorValue : ""
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
              {t("continueWithAddress")}
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
          <Link href={`/${locale}`} className="govie-back-link">
            {t("back")}
          </Link>
        </div>
      </div>
    </div>
  );
};
