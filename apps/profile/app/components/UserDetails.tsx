import { PgSessions } from "auth/sessions";
import { getTranslations } from "next-intl/server";
import { pgpool } from "../utils/postgres";
import dayjs from "dayjs";
import ds from "design-system";
import { form, postgres } from "../utils";
import { revalidatePath } from "next/cache";

async function submitAction(formData: FormData) {
  "use server";

  const { userId } = await PgSessions.get();

  const formErrors: form.Error[] = [];

  const phone = formData.get("phone")?.toString();
  formErrors.push(
    ...form.validation.stringNotEmpty(form.fieldTranslationKeys.phone, phone),
  );

  const email = formData.get("email")?.toString();
  formErrors.push(
    ...form.validation.emailErrors(form.fieldTranslationKeys.email, email),
  );

  if (formErrors.length) {
    await form.insertErrors(formErrors, userId);

    return revalidatePath("/");
  }

  const dayOfBirth = formData.get("dayOfBirth");
  const monthOfBirth = formData.get("monthOfBirth");
  const yearOfBirth = formData.get("yearOfBirth");

  const dateOfBirth = new Date(
    Number(yearOfBirth),
    Number(monthOfBirth) - 1,
    Number(dayOfBirth),
  );

  let data = {
    user_id: userId,
    date_of_birth: dateOfBirth,
    title: "",
    firstName: "",
    lastName: "",
    ppsn: "",
    ppsn_visible: false,
    gender: "",
    phone: "",
    email: "",
  };

  const formIterator = formData.entries();
  let iterResult = formIterator.next();

  while (!iterResult.done) {
    const [key, value] = iterResult.value;

    if (
      [
        "title",
        "firstName",
        "lastName",
        "ppsn",
        "gender",
        "phone",
        "email",
      ].includes(key)
    ) {
      data[key] = value;
    }

    iterResult = formIterator.next();
  }

  const currentDataResults = await postgres.pgpool.query(
    `
      SELECT * FROM user_details
      WHERE user_id = $1
  `,
    [userId],
  );

  const keys = Object.keys(data);
  const values = Object.values(data);

  if (currentDataResults.rows.length > 0) {
    const setClause = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");

    await postgres.pgpool.query(
      `
        UPDATE user_details
        SET ${setClause}, updated_at = now()
        WHERE user_id = $${keys.length + 1}
      `,
      [...values, userId],
    );
  } else {
    const columns = keys.join(", ");
    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

    await postgres.pgpool.query(
      `
        INSERT INTO user_details (${columns})
        VALUES (${placeholders})
      `,
      values,
    );
  }
}

async function getUserDetails() {
  const { firstName, lastName, email, userId } = await PgSessions.get();

  const res = await pgpool.query<{
    title: string;
    date_of_birth: string;
    ppsn: string;
    ppsn_visible: boolean;
    gender: string;
    phone: string;
  }>(
    `SELECT title, date_of_birth, ppsn, ppsn_visible, gender, phone FROM user_details WHERE user_id = $1`,
    [userId],
  );

  const { title, date_of_birth, ppsn, ppsn_visible, gender, phone } =
    res.rows[0] || {};

  return {
    userId,
    firstName,
    lastName,
    email,
    /** the defaults below should eventually be removed as the data should never be null */
    title: title || "Mr",
    date_of_birth: date_of_birth || new Date("1990-01-01T00:00:00Z"),
    ppsn: ppsn || "9876543W",
    ppsn_visible: ppsn_visible || false,
    gender: gender || "male",
    phone: phone || "01234567891",
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
    ppsn_visible,
    gender,
    phone,
  } = await getUserDetails();

  async function togglePPSN() {
    "use server";

    const userExistsQuery = await postgres.pgpool.query(
      `
        SELECT ppsn_visible
        FROM user_details
        WHERE user_id = $1
      `,
      [userId],
    );

    if (userExistsQuery.rows.length > 0) {
      const isPPSNVisible = userExistsQuery.rows[0].ppsn_visible;
      await postgres.pgpool.query(
        `
            UPDATE user_details
            SET ppsn_visible = $1, updated_at = now()
            WHERE user_id = $2
          `,
        [!isPPSNVisible, userId],
      );
    } else {
      await postgres.pgpool.query(
        `
            INSERT INTO user_details (user_id, ppsn_visible, firstname, lastname, email)
            VALUES ($1, TRUE, $2, $3, $4)
          `,
        [userId, firstName, lastName, email],
      );
    }

    revalidatePath("/");
  }

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
    <form action={submitAction}>
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
                  type={ppsn_visible ? "text" : "password"}
                  id="ppsn-field"
                  name="ppsn"
                  className="govie-input"
                  aria-labelledby="ppsn-field-hint"
                  readOnly
                  defaultValue={ppsn}
                  style={{ pointerEvents: "none" }}
                />
                <button
                  data-module="govie-button"
                  className="govie-button govie-button--secondary"
                  style={{ marginBottom: 0, width: "90px", minWidth: "90px" }}
                  formAction={togglePPSN}
                >
                  {ppsn_visible ? t("hide") : t("reveal")}
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
