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
  /* 
  Commenting out the code to make the menu stay open when JS is disabled, as agreed with Tiago, 
  so to hot fix a bug where the menu would open and close as this component was re-rendered
  */
  // const mounted = useClientSide();

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

  // const showMenu = menuOpen || !mounted;
  const showMenu = menuOpen;

  const closeSidebar = () => {
    toggleSidebar(false);
  };

  return (
    <div
      className={`${styles.hamburgerMenuWrapper}  ${showMenu ? styles.visible : ""}`}
    >
      {showMenu && <div className={styles.backdrop} onClick={closeSidebar} />}

      <div className={`${styles.sidebar} ${showMenu ? styles.visible : ""}`}>
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
