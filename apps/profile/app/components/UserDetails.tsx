import { getLocale, getTranslations } from "next-intl/server";
import dayjs from "dayjs";
import ds from "design-system";
import { form } from "../utils";
import { revalidatePath } from "next/cache";
import { AuthenticationFactory } from "../utils/authentication-factory";

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
    await form.insertErrors(formErrors, userId, "user");

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
    dateOfBirth: dateOfBirth,
    title: "",
    firstname: "",
    lastname: "",
    ppsn: "",
    ppsnVisible: false,
    gender: "",
    phone: "",
    email: "",
    preferredLanguage: await getLocale(),
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
        "preferredLanguage",
      ].includes(key)
    ) {
      data[key] = value;
    }

    iterResult = formIterator.next();
  }

  const submitProfile = await AuthenticationFactory.getProfileClient();
  const { data: currentDataResults, error } =
    await submitProfile.getUser(userId);

  if (error) {
    //handle error
    return;
  }

  if (currentDataResults) {
    const result = await submitProfile.updateUser(userId, data);

    if (result?.error) {
      //handle error
    }
  } else {
    const { error } = await submitProfile.createUser(data);

    if (error) {
      //handle error
    }
  }
}

export default async () => {
  const t = await getTranslations("UserDetails");
  const errorT = await getTranslations("FormErrors");
  const titles = ["Mr", "Mrs", "Miss", "Ms"];

  const red = ds.colours.ogcio.red;
  const mainAuth = AuthenticationFactory.getInstance();
  const mainProfile = await AuthenticationFactory.getProfileClient();
  const mainUser = await mainAuth.getUser();
  const { data, error } = await mainProfile.getUser(mainUser.id);

  if (error) {
    // handle error
  }

  /**  NOTE: the defaults below are for demo purposes only given we don't have access to real user data yet */
  const defaultData = {
    firstName: "Name",
    lastName: "Surname",
    email: "test@email.com",
    title: "Mr",
    dateOfBirth: String(new Date("1990-01-01T00:00:00Z")),
    ppsn: "9876543W",
    ppsnVisible: false,
    gender: "male",
    phone: "01234567891",
    consenttToPrefillData: false,
    preferredLanguage: "en",
  };

  //Temporarily use default data if user is not found or no data is returned
  const userData = data || defaultData;

  const {
    firstName,
    lastName,
    email,
    title,
    dateOfBirth,
    ppsn,
    ppsnVisible,
    gender,
    phone,
    preferredLanguage,
  } = userData;

  async function togglePPSN() {
    "use server";
    const toggleInstance = AuthenticationFactory.getInstance();
    const toggleProfile = await AuthenticationFactory.getProfileClient();
    const toggleUser = await toggleInstance.getUser();
    const { data: userExistsQuery, error } = await toggleProfile.getUser(
      toggleUser.id,
    );

    if (error) {
      //handle error
      return;
    }

    if (userExistsQuery) {
      const isPPSNVisible = userExistsQuery.ppsnVisible;

      const result = await mainProfile.patchUser(toggleUser.id, {
        ppsnVisible: !isPPSNVisible,
      });

      if (result?.error) {
        //handle error
      }
    } else {
      const { error } = await mainProfile.createUser({
        firstname: firstName,
        lastname: lastName,
        email,
        preferredLanguage,
      });

      if (error) {
        //handle error
      }
    }

    revalidatePath("/");
  }

  const dob = dayjs(dateOfBirth);
  const dayOfBirth = dob.date();
  const monthOfBirth = dob.month() + 1;
  const yearOfBirth = dob.year();

  const errors = await form.getErrorsQuery(mainUser.id, "user");

  const phoneError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.phone,
  );

  const emailError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.email,
  );

  return (
    <form action={submitAction}>
      <input type="hidden" name="userId" defaultValue={mainUser.id} />
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
            defaultValue={title ?? ""}
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
            name="lastname"
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
                  type={ppsnVisible ? "text" : "password"}
                  id="ppsn-field"
                  name="ppsn"
                  className="govie-input"
                  aria-labelledby="ppsn-field-hint"
                  readOnly
                  defaultValue={ppsn ?? ""}
                  style={{ pointerEvents: "none" }}
                />
                <button
                  data-module="govie-button"
                  className="govie-button govie-button--secondary"
                  style={{ marginBottom: 0, width: "90px", minWidth: "90px" }}
                  formAction={togglePPSN}
                >
                  {ppsnVisible ? t("hide") : t("reveal")}
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
              defaultValue={phone ?? ""}
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
