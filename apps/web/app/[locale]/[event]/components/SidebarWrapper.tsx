"use client";

import { useState } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import LifeEventsMenu from "./BurgerMenu/LifeEventsMenu";

type TSidebarWrapperProps = {
  userName: string;
  ppsn: string;
  selected: string;
  options: {
    key: string;
    url: string;
    icon: string;
    label: string;
  }[];
  locale: string;
};

export default ({
  userName,
  ppsn,
  selected,
  options,
  locale,
}: TSidebarWrapperProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(selected);

  const toggleSidebar = (status: boolean) => {
    setSidebarOpen(status);
  };

  const clickCallback = (selectedElement: string) => {
    setSelectedItem(selectedElement);
    toggleSidebar(false);
  };

  return (
    <Sidebar
      params={{ locale }}
      open={sidebarOpen}
      toggleSidebar={toggleSidebar}
    >
      <LifeEventsMenu
        userName={userName}
        ppsn="TUV1234123"
        selected={selectedItem}
        options={options}
        locale={locale}
        clickCallback={clickCallback}
      />
    </Sidebar>
  );
};
