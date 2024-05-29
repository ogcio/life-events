import Link from "next/link";
import ds from "design-system/";
import { PgSessions } from "auth/sessions";
import Hamburger from "../HamburgerMenu";
import HeaderSvg from "./HeaderSvg";
import LanguageSwitch from "./LanguageSwitch";
import UserIcon from "./UserIcon";
import { getUser } from "../../../libraries/auth";
import { BuildingBlockSelector } from "shared-components";

import styles from "./Header.module.scss";

type HeaderProps = {
  locale: string;
};

export default async ({ locale }: HeaderProps) => {
  let user;

  if (process.env.USE_LOGTO_AUTH === "true") {
    user = await getUser();
  }

  const { firstName, lastName, publicServant } = await PgSessions.get();
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
            <BuildingBlockSelector locale={locale as "en" | "ga"} />
            <Hamburger
              userName={`${firstName} ${lastName}`}
              publicServant={publicServant}
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
            <div className="govie-!-font-size-12">
              {process.env.USE_LOGTO_AUTH === "true" && (
                <>
                  Logto enabled{" "}
                  {user && user.isAuthenticated ? (
                    <>{user.id + " - " + user.claims.name}</>
                  ) : (
                    <>Not logged in</>
                  )}
                </>
              )}
            </div>

            <LanguageSwitch theme="dark" />
            <UserIcon initials={initials} />

            <Link
              href={`${process.env.AUTH_SERVICE_URL}/auth/logout?redirectUrl=${process.env.HOST_URL}`}
              prefetch={false}
              style={{ display: "flex" }}
            >
              <ds.Icon icon="logout" color={ds.colours.ogcio.white} size={22} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
