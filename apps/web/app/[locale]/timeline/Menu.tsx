"use client";
import ds from "design-system";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default ({
  userName,
  handleCategoryChange,
  handleSearchChange,
}: {
  userName: string;
  handleCategoryChange: (value: string) => void;
  handleSearchChange: (value: string) => void;
}) => {
  const tintGold = ds.hexToRgba(ds.colours.ogcio.gold, 15);

  const categories = ["Driving", "Employment", "Health", "Housing"];

  const checkboxes = categories.map((service: string, index: number) => (
    <div className="govie-checkboxes__item" key={service}>
      <input
        className="govie-checkboxes__input"
        id={`servicesToInform-${index}`}
        name="servicesToInform"
        type="checkbox"
        value={service}
        onChange={(e) => handleCategoryChange(e.target.value)}
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
        href="/events"
        className="govie-back-link"
        style={{ marginTop: "0" }}
      >
        Back to My Portal
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
        <div>
          <button
            className="govie-button"
            style={{ width: "100%", marginBottom: "0" }}
          >
            + Add an Event
          </button>
        </div>
      </li>
      <li>
        <form>
          <div className="govie-form-group" style={{ marginBottom: "15px" }}>
            <input
              type="text"
              id="default-input"
              name="default-input"
              className="govie-input"
              placeholder={"Search event..."}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="govie-form-group" style={{ marginBottom: "15px" }}>
            <select
              className="govie-select"
              id="default-select"
              name="default-select"
              style={{ minWidth: "initial", width: "100%" }}
              onChange={(e) =>
                console.log("== VIEW CHANGED ===", e.target.value)
              }
            >
              <option value="year">Year</option>
              <option value="month">Month</option>
              <option value="week">Week</option>
            </select>
          </div>
          <div className="govie-form-group" style={{ marginBottom: "15px" }}>
            <fieldset className="govie-fieldset">
              <legend
                className="govie-fieldset__legend govie-fieldset__legend--l"
                style={{ marginBottom: 0 }}
              >
                <p className="govie-heading-m">Services</p>
              </legend>
              <div
                className="govie-checkboxes govie-checkboxes--small"
                data-module="govie-checkboxes"
              >
                {checkboxes}
              </div>
            </fieldset>
          </div>
        </form>
      </li>
    </ol>
  );
};
