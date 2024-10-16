import React, { PropsWithChildren } from "react";

export async function ItemContainer(props: PropsWithChildren) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "24px",
        paddingBottom: "24px",
      }}
    >
      {props.children}
    </div>
  );
}
