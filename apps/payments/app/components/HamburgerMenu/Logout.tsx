"use server";
import Link from "next/link";
import ds from "design-system/";
import styles from "./HamburgerMenu.module.scss";
import { getTranslations } from "next-intl/server";

export default async () => {
  const t = await getTranslations("Menu");

  return (
    <div className={styles.logoutContainer}>
      <Link
        aria-label="signout"
        href={"/signout"}
        prefetch={false}
        className={`govie-button govie-button--icon govie-button--flat govie-button--icon govie-!-font-size-16 ${styles.menuLink}`}
      >
        <ds.Icon
          icon="logout"
          className="govie-button__icon-left"
          color={ds.colours.ogcio.darkGreen}
        />
        {t("logout")}
      </Link>
    </div>
  );
};
