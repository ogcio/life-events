import { ComponentProps } from "react";

import Link from "next/link";
import ds from "design-system";
import { messages } from "../utils";
import styles from "./HamburgerMenu.module.scss";

// TODO: Rebrand, genericify, move to shared components lib

type Props = {
  options: Awaited<ReturnType<typeof messages.sideMenuOptions>>;
  selected: string;
  userName: string;
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
    <ol
      className={`govie-list govie-list--spaced ${styles.hamburgerMenu}`}
      style={{ width: "250px" }}
    >
      <li
        key="userinfo"
        style={{
          background: tintGold,
          display: "flex",
          alignItems: "center",
          paddingLeft: "12px",
          height: "65px",
        }}
      >
        <label className="govie-label--s govie-!-font-size-16">
          {props.userName}
        </label>
      </li>
      {props.options.map((option) => (
        <li key={`lem_${option.url}`} tabIndex={0}>
          <Link
            className={`govie-button govie-button--icon govie-button--flat govie-button--icon govie-!-font-size-16 ${styles.menuLink}`}
            style={{
              background: props.selected.includes(option.key) ? tintGold : "",
            }}
            href={`/${option.url}`}
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
