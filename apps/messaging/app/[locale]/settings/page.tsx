import { CSSProperties } from "react";
import ds from "design-system";
import Link from "next/link";
import { usersSettingsRoutes } from "../../utils/routes";
import { getTranslations } from "next-intl/server";
import {
  searcKeySettingType,
  searchValueOrganisation,
} from "../../utils/messaging";
import Organisations from "./Organisations";

export const linkStyle = (selected: boolean): CSSProperties => {
  const props: CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "4px 4px 0 0",
    padding: "10px 20px 10px 20px",
    background: selected ? "transparent" : ds.colours.ogcio.lightGrey,
  };
  if (selected) {
    props.border = `1px solid ${ds.colours.ogcio.midGrey}`;
    props.borderStyle = "solid solid none solid";
  }

  return props;
};

export const linkClassName = (selected: boolean): string =>
  `govie-link govie-!-font-size-19 govie-link--no-visited-state ${
    selected ? "govie-link--no-underline" : ""
  }`.trim();

export default async (props: {
  params: { locale: string };
  searchParams?: { settingType?: string; deleteId?: string };
}) => {
  const t = await getTranslations("userSettings.Page");
  const settingType = props.searchParams?.settingType;
  const isOrganisation =
    settingType === searchValueOrganisation || !settingType;

  return (
    <>
      <h1>
        <span style={{ margin: "unset" }} className="govie-heading-xl">
          {t("header")}
        </span>
      </h1>
      <nav style={{ display: "flex", width: "fit-content", gap: "15px" }}>
        <div style={linkStyle(isOrganisation)}>
          <Link
            href={(() => {
              const url = new URL(
                usersSettingsRoutes.url,
                process.env.HOST_URL,
              );
              url.searchParams.append(
                searcKeySettingType,
                searchValueOrganisation,
              );
              return url.href;
            })()}
            className={linkClassName(isOrganisation)}
          >
            {t("organisationsLink")}
          </Link>
        </div>
      </nav>
      <div>{isOrganisation && <Organisations />}</div>
    </>
  );
};
