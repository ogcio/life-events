import Link from "next/link";
import ds from "design-system/";
import LanguageSwitch from "./LanguageSwitch";
import UserIcon from "./UserIcon";
import { BuildingBlockSelector } from "shared-components";

import styles from "./Header.module.scss";
import HeaderSvg from "./HeaderSvg";
import { getTranslations } from "next-intl/server";
import { logtoSignout } from "../utils/routes";

type HeaderProps = {
  locale: string;
};

export default async ({ locale }: HeaderProps) => {
  const t = await getTranslations("Header");

  return (
    <header
      role="banner"
      data-module="govie-header"
      className={`govie-header ${styles.govieHeader}`}
    >
      <div className={`govie-header__container ${styles.innerWrapper}`}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div className={styles.leftSideContainer}>
            <a
              href="/"
              className="govie-header__link govie-header__link--homepage"
              style={{ display: "block" }}
            >
              <HeaderSvg />
              <span className="govie-visually-hidden">gov.ie</span>
            </a>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              marginTop: "3px",
            }}
          >
            <div className="govie-!-font-size-27">
              <strong>{t("myLifeEvents")}</strong>
            </div>
          </div>
          <div className={styles.rightsideContainer}>
            <LanguageSwitch theme="dark" />
            <UserIcon />

            <Link
              href={logtoSignout.url}
              prefetch={false}
              style={{ display: "flex" }}
            >
              <ds.Icon icon="logout" color={ds.colours.ogcio.white} size={22} />
            </Link>
            <BuildingBlockSelector locale={locale} />
          </div>
        </div>
      </div>
    </header>
  );
};
