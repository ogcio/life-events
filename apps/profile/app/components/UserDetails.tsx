import { getTranslations } from "next-intl/server";

export default async () => {
  const t = await getTranslations("AboutMe");
  const titles = ["Mr", "Mrs", "Miss", "Ms"];
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
    </>
  );
};
