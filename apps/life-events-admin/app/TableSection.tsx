import React from "react";

export default (props: React.PropsWithChildren) => (
  <section
    style={{
      margin: "25px 0",
      paddingBottom: "10px",
      border: "1px solid #D8DADF",
      borderRadius: "2px",
    }}
  >
    {props.children}
  </section>
);
