"use client";
import ds from "design-system/";

export default () => {
  return (
    <button
      aria-label="events-menu"
      style={{
        cursor: "pointer",
        background: "none",
        color: "inherit",
        border: "none",
        padding: 0,
        font: "inherit",
        outline: "inherit",
      }}
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
    </button>
  );
};
