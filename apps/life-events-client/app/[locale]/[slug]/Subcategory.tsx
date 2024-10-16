import React, { PropsWithChildren } from "react";
import { Link } from "../../../data/data";
import { translate } from "../../../utils/locale";
import { Icon } from "@govie-ds/react";
import "./Links.css";

export async function ItemContainer(props: PropsWithChildren) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        paddingBottom: "24px",
        gap: "24px",
      }}
    >
      {props.children}
    </div>
  );
}
