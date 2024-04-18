"use client";
import ds from "design-system/";

export default () => {
  return (
    <div
      style={{ cursor: "pointer" }}
      onClick={() => {
        window.dispatchEvent(new Event("toggleSidebar"));
      }}
    >
      <ds.Icon
        icon="hamburger-menu"
        color={ds.colours.ogcio.white}
        heigth={12}
        width={18}
      />
    </div>
  );
};
