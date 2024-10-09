import React, { PropsWithChildren } from "react";

export default (props: PropsWithChildren) => (
  <h2
    style={{
      color: "var(--Text-Primary, var(--gray-950, #0B0C0C))",
      fontFamily: "Lato",
      fontSize: "24px",
      fontStyle: "normal",
      fontWeight: 700,
      lineHeight: "30px",
    }}
  >
    {props.children}
  </h2>
);
