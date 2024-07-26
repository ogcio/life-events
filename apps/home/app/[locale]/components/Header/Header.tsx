import Link from "next/link";
import ds from "design-system/";
import Hamburger from "../HamburgerMenu";
import HeaderSvg from "./HeaderSvg";
import LanguageSwitch from "./LanguageSwitch";
import UserIcon from "./UserIcon";
import { envProduction } from "../../../../constants";

import styles from "./Header.module.scss";
import { AuthenticationFactory } from "../../../../libraries/authentication-factory";
import { getTranslations } from "next-intl/server";

type HeaderProps = {
  locale: string;
};

const showLogin = () => {
  const environment = String(process.env.ENVIRONMENT);
  return environment !== envProduction;
};

export default async ({ locale }: HeaderProps) => {
  const t = await getTranslations("Menu");

  const instance = AuthenticationFactory.getInstance();
  const isLoggedIn = await instance.isAuthenticated();

  let isPublicServant = true;
  let initials = "";
  let userName = "";

  if (isLoggedIn) {
    const context = await instance.getContext();
    isPublicServant = context.isPublicServant;
    userName = context.user.name || "";
    const [firstName, lastName] = userName.split(" ");
    initials = firstName.charAt(0) + lastName.charAt(0);
  }

  return (
    <header role="banner" data-module="govie-header" className="govie-header">
      <div
        className={`govie-width-container govie-header__container`}
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
            {isLoggedIn && (
              <Hamburger
                userName={`${userName}`}
                publicServant={isPublicServant}
                locale={locale}
              />
            )}
            <a
              href="/"
              className="govie-header__link govie-header__link--homepage"
              style={{ display: "block" }}
            >
              <HeaderSvg />
              <span className="govie-visually-hidden">gov.ie</span>
            </a>
          </div>
          <div className={styles.rightsideContainer}>
            {isLoggedIn && (
              <>
                <LanguageSwitch theme="dark" />
                <UserIcon initials={initials} />

                <Link
                  href={`/${locale}/signout`}
                  prefetch={false}
                  style={{ display: "flex" }}
                >
                  <ds.Icon
                    icon="logout"
                    color={ds.colours.ogcio.white}
                    size={22}
                  />
                </Link>
              </>
            )}

            {!isLoggedIn && showLogin() && (
              <Link
                href={`/${locale}/login`}
                prefetch={false}
                style={{ display: "flex" }}
                className={styles.loginLink}
              >
                {t("login")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
