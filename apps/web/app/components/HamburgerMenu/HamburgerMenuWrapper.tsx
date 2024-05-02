"use client";

import useClientSide from "../hooks/useClientSide";
import { useEffect, useState } from "react";
import HamburgerMenu from "./HamburgerMenu";
import styles from "./HamburgerMenu.module.scss";

type Props = {
  locale: string;
  path?: string;
  userName: string;
  selected: string;
  options: {
    key: string;
    url: string;
    icon: string;
    label: string;
  }[];
};

export default ({ userName, selected, options, locale, path }: Props) => {
  const mounted = useClientSide();

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(selected);

  const toggleSidebar = (status: boolean) => {
    setMenuOpen(status);
  };

  const clickCallback = (selectedElement: string) => {
    setSelectedItem(selectedElement);
    toggleSidebar(false);
  };

  useEffect(() => {
    const listener = () => {
      toggleSidebar(!menuOpen);
    };

    window.addEventListener("toggleSidebar", listener);
    return () => {
      window.removeEventListener("toggleSidebar", listener);
    };
  }, []);

  const sidebarClasses = [styles.sidebar];
  if (menuOpen || !mounted) {
    sidebarClasses.push(styles.visible);
  }

  const closeSidebar = () => {
    toggleSidebar(false);
  };

  return (
    <div
      className={styles.hamburgerMenuWrapper}
      style={{
        display: menuOpen ? "block" : "none",
      }}
    >
      {menuOpen && <div className={styles.backdrop} onClick={closeSidebar} />}

      <div className={sidebarClasses.join(" ")}>
        <HamburgerMenu
          options={options}
          selected={selected}
          userName={userName}
          locale={locale}
          clickCallback={clickCallback}
          path={path}
        />
      </div>
    </div>
  );
};
