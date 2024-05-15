"use client";
import ds from "design-system/";
import { useCallback, useState } from "react";
import HamburgerMenuWrapper from "./HamburgerMenuWrapper";
import styles from "./HamburgerMenu.module.scss";

export default ({ userName }: { userName: string }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const onClick = useCallback(() => setMenuOpen(false), [setMenuOpen]);

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
      <HamburgerMenuWrapper
        userName={userName}
        menuOpen={menuOpen}
        handleClick={onClick}
      />
    </>
  );
};
