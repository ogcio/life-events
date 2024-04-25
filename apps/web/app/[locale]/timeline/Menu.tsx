"use client";
import ds from "design-system";
import { useTranslations } from "next-intl";
import Link from "next/link";

const Icon = ds.Icon;

export default ({
  userName,
  handleCategoryChange,
  handleSearchChange,
  searchEvent,
  locale,
}: {
  userName: string;
  handleCategoryChange: (value: string) => void;
  handleSearchChange: (value: string) => void;
  searchEvent: () => void;
  locale: string;
}) => {
  const t = useTranslations();
  const tintGold = ds.hexToRgba(ds.colours.ogcio.gold, 15);

  const categories = [t("driving"), t("employment"), t("housing")];

  const checkboxes = categories.map((service: string, index: number) => (
    <div className="govie-checkboxes__item" key={service}>
      <input
        className="govie-checkboxes__input"
        id={`servicesToInform-${index}`}
        name="servicesToInform"
        type="checkbox"
        value={service}
        onChange={(e) => handleCategoryChange(e.target.value.toLowerCase())}
      />
      <label
        className="govie-label--s govie-checkboxes__label"
        htmlFor={`servicesToInform-${index}`}
        style={{ fontWeight: "normal" }}
      >
        {service}
      </label>
    </div>
  ));

  return (
    <ol
      className="govie-list govie-list--spaced"
      style={{
        width: "200px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Link
        href={`/${locale}/events`}
        className="govie-back-link"
        style={{ marginTop: "0" }}
      >
        {t("backToPortal")}
      </Link>
      <li
        key="userinfo"
        style={{
          background: tintGold,
          display: "flex",
          alignItems: "center",
          paddingLeft: "12px",
          height: "65px",
        }}
      >
        <label className="govie-label--s govie-!-font-size-16">
          {userName}
        </label>
      </li>
      <li>
        <div className="govie-form-group" style={{ marginBottom: "15px" }}>
          <div className="govie-input__wrapper">
            <input
              type="text"
              id="default-input"
              name="default-input"
              className="govie-input"
              placeholder={t("searchEvent")}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <button
              type="button"
              className="govie-input__suffix"
              style={{ cursor: "pointer" }}
              onClick={() => searchEvent()}
              aria-label={t("search")}
            >
              <Icon icon={"search"} color={ds.colours.ogcio.darkGreen} />
            </button>
          </div>
        </div>
        <div className="govie-form-group" style={{ marginBottom: "15px" }}>
          <fieldset className="govie-fieldset">
            <legend
              className="govie-fieldset__legend govie-fieldset__legend--l"
              style={{ marginBottom: 0 }}
            >
              <p className="govie-heading-s">{t("filterByService")}</p>
            </legend>
            <div
              className="govie-checkboxes govie-checkboxes--small"
              data-module="govie-checkboxes"
            >
              {checkboxes}
            </div>
          </fieldset>
        </div>
      </li>
    </ol>
  );
};
