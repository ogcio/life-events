import { ComponentProps } from "react";

import Link from "next/link";
import ds from "design-system";

// TODO: Rebrand, genericify, move to shared components lib

type Props = {
  options: {
    key: string;
    url: string;
    icon?: ComponentProps<typeof ds.Icon>["icon"];
    label: string;
  }[];
  selected: string;
};

export default (props: Props) => {
  const tintGold = ds.hexToRgba(ds.colours.ogcio.gold, 15);

  return (
    <ol className="govie-list govie-list--spaced" style={{ width: "250px" }}>
      {props.options.map((option) => (
        <li key={`lem_${option.url}`} tabIndex={0}>
          <Link
            className="govie-button govie-button--icon govie-button--flat govie-button--icon govie-!-font-size-16"
            href={`/${option.url}`}
            style={{
              margin: "unset",
              paddingLeft: "12px",
              width: "100%",
              display: "flex",
              justifyContent: "flex-start",
              background: props.selected === option.key ? tintGold : "",
            }}
          >
            {option.icon ? (
              <ds.Icon
                // make option typeof the icons
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
