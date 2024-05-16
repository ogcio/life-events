"use client";
import ds from "design-system/";
import { useCallback, useState } from "react";
import styles from "./HamburgerMenu.module.scss";
import HamburgerMenu from "./HamburgerMenu";

export default ({ userName }: { userName: string }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleClick = useCallback(() => setMenuOpen(false), [setMenuOpen]);

  return (
    <>
      <button
        aria-label="events-menu"
        className={styles.hamburgerButton}
        style={{
          cursor: "pointer",
          background: "none",
          color: "inherit",
          border: "none",
          padding: 0,
          font: "inherit",
          outline: "inherit",
        }}
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
          <HamburgerMenu userName={userName} handleClick={handleClick} />
        </div>
      </div>
    </>
  );
};
