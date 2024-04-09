import ds from "design-system";
import { getTranslations } from "next-intl/server";
import "./ProfileForm.css";

export default async () => {
  const t = await getTranslations("ProfileDetails");
  const titles = ["Mr", "Mrs", "Miss", "Ms"];
  return (
    <div>
      <p
        className="govie-body"
        style={{ display: "flex", alignItems: " center" }}
      >
        <span style={{ marginRight: "10px" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25">
            <path
              d="M12.5 0C19.402 0 25 5.598 25 12.5S19.402 25 12.5 25 0 19.402 0 12.5 5.598 0 12.5 0Zm0 0"
              fill="#0b0c0c"
            />
            <path
              d="M12.875 16.887h-.75l-.578-10.461h1.906Zm-1.18 4.543v-1.614h1.61v1.614Zm0 0"
              fill="#fff"
            />
          </svg>{" "}
        </span>
        <strong>
          Fields labelled with a{" "}
          <span style={{ color: ds.colours.ogcio.red }}>*</span> are editable.
          All others are view only.
        </strong>
      </p>
      <h2 className="govie-heading-m">{t("name")}</h2>
      <div
        className="govie-form-group"
        style={{ display: "flex", gap: "20px" }}
      >
        <div>
          <div className="govie-hint" id="title-field-hint">
            {t("title")}
          </div>
          <select className="govie-select" aria-labelledby="title-field-hint">
            {titles.map((title) => (
              <option value="choose">{title}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <div className="govie-hint" id="firstName-field-hint">
            {t("firstName")}
          </div>
          <input
            type="text"
            id="input-field"
            name="input-field"
            className="govie-input"
            aria-labelledby="firstName-field-hint"
            disabled
          />
        </div>
        <div style={{ flex: 1 }}>
          <div className="govie-hint" id="surname-field-hint">
            {t("surname")}
          </div>
          <input
            type="text"
            id="input-field"
            name="input-field"
            className="govie-input"
            aria-labelledby="surname-field-hint"
            disabled
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
              <div className="govie-hint" id="day-field-hint">
                {t("day")}
              </div>
              <input
                type="text"
                id="input-field"
                name="input-field"
                className="govie-input govie-input--width-2"
                aria-labelledby="day-field-hint"
                disabled
              />
            </div>
            <div>
              <div className="govie-hint" id="month-field-hint">
                {t("month")}
              </div>
              <input
                type="text"
                id="input-field"
                name="input-field"
                className="govie-input govie-input--width-2"
                aria-labelledby="month-field-hint"
                disabled
              />
            </div>
            <div>
              <div className="govie-hint" id="year-field-hint">
                {t("year")}
              </div>
              <input
                type="text"
                id="input-field"
                name="input-field"
                className="govie-input govie-input--width-4"
                aria-labelledby="year-field-hint"
                disabled
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
              <div className="govie-hint" id="reveal-field-hint">
                {t("clickToReveal")}
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "20px" }}
              >
                <input
                  type="text"
                  id="input-field"
                  name="input-field"
                  className="govie-input"
                  aria-labelledby="reveal-field-hint"
                  disabled
                />
                <button
                  type="button"
                  data-module="govie-button"
                  className="govie-button govie-button--secondary"
                  style={{ marginBottom: 0 }}
                >
                  Reveal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <h2 className="govie-heading-m" id="gender-title">
        {t("gender")}
      </h2>
      <div
        data-module="govie-radios"
        className="govie-radios govie-radios--large govie-radios--inline"
      >
        <div className="govie-radios__item" style={{ paddingLeft: 0 }}>
          <div className="govie-radios__item">
            <input
              id="male-option"
              name="male"
              type="radio"
              value="agree"
              className="govie-radios__input"
              disabled
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
              name="female"
              type="radio"
              value="disagree"
              className="govie-radios__input"
              disabled
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
  );
};
