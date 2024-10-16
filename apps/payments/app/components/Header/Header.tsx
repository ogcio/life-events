import Link from "next/link";
import ds from "design-system/";
import Hamburger from "../HamburgerMenu";
import HeaderSvg from "./HeaderSvg";
import LanguageSwitch from "./LanguageSwitch";
import UserIcon from "./UserIcon";
import { BuildingBlockSelector } from "shared-components";

import styles from "./Header.module.scss";
import { AuthenticationFactory } from "../../../libraries/authentication-factory";

type HeaderProps = {
  locale: string;
};

export default async ({ locale }: HeaderProps) => {
  const { user, isPublicServant } =
    await AuthenticationFactory.getInstance().getContext();

  const [firstName, lastName] = user.name ? user.name.split(" ") : ["", ""];
  const initials = firstName.charAt(0) + lastName.charAt(0);

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
            <Hamburger
              userName={`${firstName} ${lastName}`}
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
              <strong>Payments</strong>
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
