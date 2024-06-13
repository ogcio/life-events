import { CSSProperties } from "react";
import ds from "design-system";
import Link from "next/link";
import { usersSettingsRoutes } from "../../utils/routes";
import { getTranslations } from "next-intl/server";
import {
  searchKeySettingType,
  searchValueOrganisation,
} from "../../utils/messaging";
import Organisations from "./Organisations";
import { linkStyle, linkClassName } from "../admin/providers/page";

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
                searchKeySettingType,
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
