"use client";
import ds from "design-system/";
import { useCallback, useState } from "react";
import styles from "./HamburgerMenu.module.scss";
import HamburgerMenu from "./HamburgerMenu";
import pinoLogger, { Logger } from "pino";

let logger: Logger;
export const getLogger = () => {
  if (!logger) {
    const deploymentEnv = process.env.NODE_ENV || "development";
    logger = pinoLogger({
      level: deploymentEnv === "production" ? "info" : "debug",
    });
  }
  return logger;
};

type MenuProviderProps = {
  userName: string;
  publicServant: boolean;
  languageSwitch: React.ReactNode;
  logout: React.ReactNode;
};

export default ({
  userName,
  publicServant,
  languageSwitch,
  logout,
}: MenuProviderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  getLogger().info("TESTING CLIENT COMPONENT");
  const handleClick = useCallback(() => setMenuOpen(false), [setMenuOpen]);

  return (
    <>
      <button
        aria-label="events-menu"
        className={styles.hamburgerButton}
        onClick={() => setMenuOpen(true)}
      >
        <ds.Icon
          icon="hamburger-menu"
          color={ds.colours.ogcio.white}
          heigth={12}
          width={18}
        />
      </button>
      <div
        className={`${styles.hamburgerMenuWrapper} ${menuOpen ? styles.visible : ""}`}
      >
        {menuOpen && <div className={styles.backdrop} onClick={handleClick} />}
        <div className={`${styles.sidebar} ${menuOpen ? styles.visible : ""}`}>
          <HamburgerMenu
            userName={userName}
            publicServant={publicServant}
            handleClick={handleClick}
            languageSwitch={languageSwitch}
            logout={logout}
          />
        </div>
      </div>
    </>
  );
};
