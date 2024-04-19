"use client";

import styles from "./Sidebar.module.css";
import useClientSide from "../hooks/useClientSide";
import { useEffect } from "react";

type TSidebarProps = {
  params: { locale: string };
  open: boolean;
  children: React.ReactNode;
  toggleSidebar: (open: boolean) => void;
};

export default ({ params, children, open, toggleSidebar }: TSidebarProps) => {
  const mounted = useClientSide();

  useEffect(() => {
    const listener = () => {
      toggleSidebar(!open);
    };

    window.addEventListener("toggleSidebar", listener);
    return () => {
      window.removeEventListener("toggleSidebar", listener);
    };
  }, []);

  const sidebarClasses = [styles.sidebar];
  if (open || !mounted) {
    sidebarClasses.push(styles.visible);
  }

  const closeSidebar = () => {
    toggleSidebar(false);
  };

  return (
    <>
      {open && <div className={styles.backdrop} onClick={closeSidebar} />}

      <div className={sidebarClasses.join(" ")}>{children}</div>
    </>
  );
};
