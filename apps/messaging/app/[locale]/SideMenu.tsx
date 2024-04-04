import { ComponentProps } from "react";

import Link from "next/link";
import ds from "design-system";
import { messages } from "../utils";

// TODO: Rebrand, genericify, move to shared components lib

type Props = {
  options: Awaited<ReturnType<typeof messages.sideMenuOptions>>;
  selected: string;
};

function background(option: Props["options"][0], selected: string) {
  if (option.type === "button") {
    return "";
  }
  if (option.key === selected) {
    return ds.hexToRgba(ds.colours.ogcio.gold, 15);
  }
  return "";
}

export default (props: Props) => {
  const tintGold = ds.hexToRgba(ds.colours.ogcio.gold, 15);
  return (
    <ol className="govie-list govie-list--spaced" style={{ width: "250px" }}>
      {props.options.map((option) => (
        <li key={`lem_${option.url}`} tabIndex={0}>
          <Link
            className={
              option.type === "button"
                ? "govie-button"
                : "govie-button govie-button--icon govie-button--flat govie-button--icon govie-!-font-size-16"
            }
            href={`/${option.url}`}
            style={{
              margin: "unset",
              paddingLeft: "12px",
              width: "100%",
              display: "flex",
              justifyContent:
                option.type === "button" ? "center" : "flex-start",
              alignItems: "center",
              background: background(option, props.selected),
            }}
          >
            {option.icon ? (
              <ds.Icon
                icon={option.icon}
                className="govie-button__icon-left"
                color={ds.colours.ogcio.darkGreen}
              />
            ) : null}
            {option.label}
          </Link>
        </li>
      ))}
    </ol>
  );
};
