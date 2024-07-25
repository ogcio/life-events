import Link from "next/link";
import ds from "design-system/";
import Hamburger from "../HamburgerMenu";
import HeaderSvg from "./HeaderSvg";
import LanguageSwitch from "./LanguageSwitch";
import UserIcon from "./UserIcon";
import { BuildingBlockSelector } from "shared-components";
import { envProduction } from "../../../../constants";

import styles from "./Header.module.scss";
// import { AuthenticationFactory } from "../../../libraries/authentication-factory";

type HeaderProps = {
  locale: string;
};

const showLogin = () => {
  const environment = String(process.env.ENVIRONMENT);
  return environment !== envProduction;
};

export default async ({ locale }: HeaderProps) => {
  // const { user, isPublicServant } =
  //   await AuthenticationFactory.getInstance().getContext();

  const isLoggedIn = false;

  const user = {
    name: "John Doe",
  };
  const isPublicServant = true;

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
            {isLoggedIn && (
              <Hamburger
                userName={`${firstName} ${lastName}`}
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
            <div className={styles.title}>
              <strong>Building Blocks</strong>
            </div>
          </div>
          <div className={styles.rightsideContainer}>
            {isLoggedIn && (
              <>
                <LanguageSwitch theme="dark" />
                <UserIcon initials={initials} />

                <Link
                  href={"/signout"}
                  prefetch={false}
                  style={{ display: "flex" }}
                >
                  <ds.Icon
                    icon="logout"
                    color={ds.colours.ogcio.white}
                    size={22}
                  />
                </Link>

                <BuildingBlockSelector locale={locale} />
              </>
            )}

            {!isLoggedIn && showLogin() && (
              <Link
                href={"/login"}
                prefetch={false}
                style={{ display: "flex" }}
                className="loginLink"
              >
                Login
              </Link>
            )}
          </div>
          <div className={styles.buildingBlocksSelector}>
            <BuildingBlockSelector locale={locale} />
          </div>
        </div>
      </div>
    </header>
  );
};
