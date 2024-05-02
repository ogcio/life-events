import ds from "design-system";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import Link from "next/link";
import submitQuery_ from "./actions/submitQuery";
import SearchForm from "./SearchForm";

const Icon = ds.Icon;

export default async ({
  userName,
  searchParams,
  locale,
}: {
  userName: string;
  searchParams: URLSearchParams;
  locale: string;
}) => {
  const t = await getTranslations("Timeline");
  const tintGold = ds.hexToRgba(ds.colours.ogcio.gold, 15);

  const path = headers().get("x-pathname")?.toString();

  const categories = ["driving", "employment", "housing"];

  const newSearchParams = new URLSearchParams(searchParams);

  const checkboxes = categories.map((service: string, index: number) => {
    let services = searchParams.get("services")?.split(",") || [];
    const checked = services.includes(service);

    if (checked) {
      services = services.filter((s) => s !== service);
    } else {
      services = [...services, service];
    }
    newSearchParams.set("services", services.toString());

    const url = `${path}?${newSearchParams.toString()}`;

    return (
      <Link
        href={url}
        style={{ textDecoration: "none", color: "black" }}
        key={service}
      >
        <div className="govie-checkboxes__item">
          <input
            className="govie-checkboxes__input"
            id={`servicesToInform-${index}`}
            name="servicesToInform"
            type="checkbox"
            value={service}
            checked={checked}
            readOnly
          />
          <label
            className="govie-label--s govie-checkboxes__label"
            htmlFor={`servicesToInform-${index}`}
            style={{ fontWeight: "normal" }}
          >
            {t(service)}
          </label>
        </div>
      </Link>
    );
  });

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
          <SearchForm searchParams={searchParams} />
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
