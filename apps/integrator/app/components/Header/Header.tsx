import Link from "next/link";
import ds from "design-system/";
import HeaderSvg from "./HeaderSvg";
import LanguageSwitch from "./LanguageSwitch";
import UserIcon from "./UserIcon";

import styles from "./Header.module.scss";
import { AuthenticationFactory } from "../../../libraries/authentication-factory";

type HeaderProps = {
  locale: string;
};

export default async ({ locale }: HeaderProps) => {
  const { user } = await AuthenticationFactory.getInstance().getContext();

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
            <a
              href="/"
              className="govie-header__link govie-header__link--homepage"
              style={{ display: "block" }}
            >
              <HeaderSvg />
            </a>
            <div className={styles.title}>
              <strong>Life events - admin dashboard</strong>
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
          </div>
        </div>
      </div>
    </header>
  );
};
