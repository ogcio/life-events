import React, { PropsWithChildren } from "react";

export default function TableNewButtonLink(
  props: PropsWithChildren<{ href: string }>,
) {
  return (
    <a
      style={{
        margin: "unset",
        display: "flex",
        padding: "0 5px",
      }}
      className="govie-button  govie-button--icon govie-button--flat "
      href={props.href}
    >
      <svg
        className="govie-button__icon-left"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14 8.5H8V14.5H6V8.5H0V6.5H6V0.5H8V6.5H14V8.5Z"
          fill="white"
        ></path>
      </svg>
      <span>{props.children}</span>
    </a>
  );
}
