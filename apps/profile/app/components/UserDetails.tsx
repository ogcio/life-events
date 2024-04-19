import { PgSessions } from "auth/sessions";
import { getTranslations } from "next-intl/server";
import dayjs from "dayjs";
import ds from "design-system";
import { form, postgres } from "../utils";
import { revalidatePath } from "next/cache";
import { Profile } from "building-blocks-sdk";

async function submitAction(formData: FormData) {
  "use server";

  const formErrors: form.Error[] = [];

  const userId = formData.get("userId")?.toString();

  if (!userId) {
    throw Error("User id not found");
  }

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

  const dateOfBirth = dayjs()
    .year(Number(yearOfBirth))
    .month(Number(monthOfBirth) - 1)
    .date(Number(dayOfBirth))
    .startOf("day")
    .toISOString();

  let data = {
    date_of_birth: dateOfBirth,
    title: "",
    firstname: "",
    lastname: "",
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
        "firstname",
        "lastname",
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

  const currentDataResults = await new Profile(userId).getUser();

  if (currentDataResults.data) {
    await new Profile(userId).updateUser(data);
  } else {
    await new Profile(userId).createUser(data);
  }
}

export default async () => {
  const t = await getTranslations("UserDetails");
  const errorT = await getTranslations("FormErrors");
  const titles = ["Mr", "Mrs", "Miss", "Ms"];

  const red = ds.colours.ogcio.red;

  const { userId } = await PgSessions.get();

  const { data } = await new Profile(userId).getUser();

  if (!data) {
    // log some error here
    return <p className="govie-body">{t("userNotFound")}</p>;
  }

  const {
    firstname,
    lastname,
    email,
    title,
    date_of_birth,
    ppsn,
    ppsn_visible,
    gender,
    phone,
  } = data;

  async function togglePPSN() {
    "use server";

    const userExistsQuery = await new Profile(userId).getUser();

    if (userExistsQuery.data) {
      const isPPSNVisible = userExistsQuery.data.ppsn_visible;

      await new Profile(userId).updateUser({
        ppsn_visible: !isPPSNVisible,
      });
    } else {
      await new Profile(userId).createUser({ firstname, lastname, email });
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
      <input type="hidden" name="userId" defaultValue={userId} />
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
            name="firstname"
            className="govie-input"
            aria-labelledby="firstName-field-hint"
            readOnly
            defaultValue={firstname}
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
            name="lastname"
            className="govie-input"
            aria-labelledby="lastName-field-hint"
            readOnly
            defaultValue={lastname}
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
