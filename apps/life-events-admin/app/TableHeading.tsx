import React from "react";

export default (props: React.PropsWithChildren) => (
  <div
    style={{
      //   padding: "5px 0",
      height: "100px",
      display: "flex",
      background: "#F7F7F8", // gray/200
      margin: "auto",
    }}
  >
    <div
      style={{
        padding: "0 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
    >
      {props.children}
    </div>
  </div>
);
