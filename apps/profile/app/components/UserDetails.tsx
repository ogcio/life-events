import { PgSessions } from "auth/sessions";
import { getTranslations } from "next-intl/server";
import { pgpool } from "../utils/postgres";
import dayjs from "dayjs";
import ds from "design-system";
import { form } from "../utils";

async function getUserDetails() {
  const { firstName, lastName, email, userId } = await PgSessions.get();

  const res = await pgpool.query<{
    title: string;
    date_of_birth: string;
    ppsn: string;
    gender: string;
    phone: string;
  }>(`SELECT * FROM user_details WHERE user_id = $1`, [userId]);

  if (res.rows.length === 0) {
    return {
      userId,
      firstName,
      lastName,
      email,
      title: "Mr",
      date_of_birth: new Date("1990-01-01T00:00:00Z"),
      ppsn: "9876543W",
      gender: "male",
      phone: "01234567891",
    };
  }

  const { title, date_of_birth, ppsn, gender, phone } = res.rows[0];
  return {
    userId,
    firstName,
    lastName,
    email,
    title,
    date_of_birth,
    ppsn,
    gender,
    phone,
  };
}

export default async () => {
  const t = await getTranslations("UserDetails");
  const errorT = await getTranslations("FormErrors");
  const titles = ["Mr", "Mrs", "Miss", "Ms"];

  const red = ds.colours.ogcio.red;

  const {
    userId,
    firstName,
    lastName,
    email,
    title,
    date_of_birth,
    ppsn,
    gender,
    phone,
  } = await getUserDetails();

  const dob = dayjs(date_of_birth);
  const dayOfBirth = dob.date();
  const monthOfBirth = dob.month() + 1;
  const yearOfBirth = dob.year();

  const errors = await form.getErrorsQuery(userId);

  const phoneError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.phone,
  );

  const emailError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.email,
  );

  return (
    <>
      <h2 className="govie-heading-m">{t("name")}</h2>
      <div
        className="govie-form-group"
        style={{ display: "flex", gap: "20px" }}
      >
        <div>
          <div className="govie-hint" id="title-field-hint">
            {t("userTitle")}
          </div>
          <select
            className="govie-select"
            aria-labelledby="title-field-hint"
            defaultValue={title}
            style={{ pointerEvents: "none" }}
            name="title"
          >
            {titles.map((option) => (
              <option value={option} key={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <div className="govie-hint" id="firstName-field-hint">
            {t("firstName")}
          </div>
          <input
            type="text"
            id="firstName-field"
            name="firstName"
            className="govie-input"
            aria-labelledby="firstName-field-hint"
            readOnly
            defaultValue={firstName}
            style={{ pointerEvents: "none" }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div className="govie-hint" id="lastName-field-hint">
            {t("lastName")}
          </div>
          <input
            type="text"
            id="lastName-field"
            name="lastName"
            className="govie-input"
            aria-labelledby="lastName-field-hint"
            readOnly
            defaultValue={lastName}
            style={{ pointerEvents: "none" }}
          />
        </div>
      </div>
      <div style={{ display: "flex", gap: "20px" }}>
        <div>
          <h2 className="govie-heading-m">{t("dateOfBirth")}</h2>
          <div
            className="govie-form-group"
            style={{ display: "flex", gap: "20px" }}
          >
            <div>
              <div className="govie-hint" id="dayOfBirth-field-hint">
                {t("day")}
              </div>
              <input
                type="text"
                id="dayOfBirth-field"
                name="dayOfBirth"
                className="govie-input govie-input--width-2"
                aria-labelledby="dayOfBirth-field-hint"
                readOnly
                defaultValue={dayOfBirth}
                style={{ pointerEvents: "none" }}
              />
            </div>
            <div>
              <div className="govie-hint" id="monthOfBirth-field-hint">
                {t("month")}
              </div>
              <input
                type="text"
                id="monthOfBirth-field"
                name="monthOfBirth"
                className="govie-input govie-input--width-2"
                aria-labelledby="monthOfBirth-field-hint"
                readOnly
                defaultValue={monthOfBirth}
                style={{ pointerEvents: "none" }}
              />
            </div>
            <div>
              <div className="govie-hint" id="yearOfBirth-field-hint">
                {t("year")}
              </div>
              <input
                type="text"
                id="yearOfBirth-field"
                name="yearOfBirth"
                className="govie-input govie-input--width-4"
                aria-labelledby="yearOfBirth-field-hint"
                readOnly
                defaultValue={yearOfBirth}
                style={{ pointerEvents: "none" }}
              />
            </div>
          </div>
        </div>
        <div>
          <h2 className="govie-heading-m">{t("ppsn")}</h2>
          <div
            className="govie-form-group"
            style={{ display: "flex", gap: "20px" }}
          >
            <div>
              <div className="govie-hint" id="ppsn-field-hint">
                {t("clickToReveal")}
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "20px" }}
              >
                <input
                  type="text"
                  id="ppsn-field"
                  name="ppsn"
                  className="govie-input"
                  aria-labelledby="ppsn-field-hint"
                  readOnly
                  defaultValue={ppsn}
                  style={{ pointerEvents: "none" }}
                />
                <button
                  type="button"
                  data-module="govie-button"
                  className="govie-button govie-button--secondary"
                  style={{ marginBottom: 0 }}
                >
                  {t("reveal")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <h2 className="govie-heading-m">{t("gender")}</h2>
      <div className="govie-form-group">
        <div
          data-module="govie-radios"
          className="govie-radios govie-radios--large govie-radios--inline"
        >
          <div className="govie-radios__item" style={{ paddingLeft: 0 }}>
            <div className="govie-radios__item">
              <input
                id="male-option"
                name="gender"
                type="radio"
                value="male"
                className="govie-radios__input"
                readOnly
                checked={gender === "male"}
                style={{ pointerEvents: "none" }}
              />
              <label
                className="govie-label--s govie-radios__label"
                htmlFor="male-option"
              >
                {t("male")}
              </label>
            </div>
            <div className="govie-radios__item">
              <input
                id="female-option"
                name="gender"
                type="radio"
                value="female"
                className="govie-radios__input"
                readOnly
                checked={gender === "female"}
                style={{ pointerEvents: "none" }}
              />
              <label
                className="govie-label--s govie-radios__label"
                htmlFor="female-option"
              >
                {t("female")}
              </label>
            </div>
          </div>
        </div>
      </div>
      <h2 className="govie-heading-m">{t("contactDetails")}</h2>
      <div
        className={`govie-form-group ${
          phoneError || emailError ? "govie-form-group--error" : ""
        }`.trim()}
      >
        <div>
          {phoneError && (
            <p id="input-field-error" className="govie-error-message">
              <span className="govie-visually-hidden">Error:</span>
              {errorT(phoneError.messageKey, {
                field: errorT(`fields.${phoneError.field}`),
                indArticleCheck: "",
              })}
            </p>
          )}
          {emailError && (
            <p id="input-field-error" className="govie-error-message">
              <span className="govie-visually-hidden">Error:</span>
              {errorT(emailError.messageKey, {
                field: errorT(`fields.${emailError.field}`),
                indArticleCheck: "",
              })}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ flex: 1 }}>
            <div className="govie-hint" id="telephone-field-hint">
              {t.rich("telephone", {
                red: (chunks) => <span style={{ color: red }}>{chunks}</span>,
              })}
            </div>
            <input
              type="number"
              id="phone-field"
              name="phone"
              className="govie-input"
              aria-labelledby="telephone-field-hint"
              defaultValue={phone}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div className="govie-hint" id="email-field-hint">
              {t.rich("email", {
                red: (chunks) => <span style={{ color: red }}>{chunks}</span>,
              })}
            </div>
            <input
              type="text"
              id="email-field"
              name="email"
              className="govie-input"
              aria-labelledby="email-field-hint"
              defaultValue={email}
            />
          </div>
        </div>
      </div>
    </>
  );
};
