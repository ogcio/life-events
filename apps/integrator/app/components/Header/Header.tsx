import Link from "next/link";
import ds from "design-system/";
import HeaderSvg from "./HeaderSvg";
import LanguageSwitch from "./LanguageSwitch";
import UserIcon from "./UserIcon";

import styles from "./Header.module.scss";
import { AuthenticationFactory } from "../../../libraries/authentication-factory";
import { BuildingBlockSelector } from "shared-components";
import HamburgerMenu from "../HamburgerMenu";

type HeaderProps = {
  locale: string;
};

export default async ({ locale }: HeaderProps) => {
  const { user, isPublicServant } =
    await AuthenticationFactory.getInstance().getContext();

  const [firstName, lastName] = user.name ? user.name.split(" ") : ["", ""];
  const initials = firstName.charAt(0) + lastName.charAt(0);

  const instance = AuthenticationFactory.getInstance();

  return (
    <header
      role="banner"
      data-module="govie-header"
      className={`govie-header ${styles.govieHeader}`}
    >
      <div
        className="govie-width-container govie-header__container"
        style={{
          maxWidth: "1280px",
          display: "flex",
          alignItems: "center",
          paddingBottom: "10px",
          height: "80px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            paddingLeft: "15px",
            paddingRight: "15px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div className={styles.leftSideContainer}>
            <HamburgerMenu
              userName={`${user.name}`}
              publicServant={isPublicServant}
              locale={locale}
            />
            <a
              href="/"
              className="govie-header__link govie-header__link--homepage"
              style={{ display: "block" }}
            >
              <HeaderSvg />
              <span className="govie-visually-hidden">gov.ie</span>
            </a>
            <div className={styles.title}>
              <strong>Journey Builder</strong>
            </div>
          </div>
          <div className={styles.rightsideContainer}>
            <LanguageSwitch theme="dark" />
            <UserIcon initials={initials} />

            <Link
              href={"/signout"}
              prefetch={false}
              style={{ display: "flex" }}
              aria-label="signout"
            >
              <ds.Icon icon="logout" color={ds.colours.ogcio.white} size={22} />
            </Link>
            <BuildingBlockSelector locale={locale} />
          </div>
          <div className={styles.buildingBlocksSelector}>
            <BuildingBlockSelector locale={locale} />
          </div>
        </div>
      </div>
    </header>
  );
};
