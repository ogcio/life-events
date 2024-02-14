import Link from "next/link";

import ds from "design-system";

const Icon = ds.Icon;

type Props = {
  options: {
    key: string;
    url: string;
    icon: string;
    label: string;
  }[];
  selected: string;
  userName: string;
  ppsn: string;
};

export default (props: Props) => {
  // Should be from a utils function
  const tintGold = ds.colours.ogcio.gold + "1A";

  return (
    <ol className="govie-list govie-list--spaced" style={{ width: "200px" }}>
      <li
        key="userinfo"
        style={{
          background: tintGold,
          padding: "0.5rem 1rem 0.5rem 1rem",
        }}
      >
        <label className="govie-label--s govie-!-font-size-16">
          {props.userName}
        </label>
        <div className="govie-!-font-size-16">{props.ppsn}</div>
      </li>
      {props.options.map((option) => (
        <li key={`lem_${option.url}`} tabIndex={0}>
          <Link
            className="govie-button govie-button--icon govie-button--flat govie-button--icon govie-!-font-size-16"
            href={`${option.url}`}
            style={{
              margin: "unset",
              paddingLeft: "12px",
              width: "100%",
              display: "flex",
              justifyContent: "flex-start",
              background: props.selected === option.key ? tintGold : "",
            }}
          >
            <Icon
              // make option typeof the icons
              icon={option.icon as any}
              className="govie-button__icon-left"
              color={ds.colours.ogcio.darkGreen}
            />
            {option.label}
          </Link>
        </li>
      ))}
    </ol>
  );
};
