import Link from "next/link";
import ds from "design-system";
import styles from "./LifeEventsMenu.module.scss";

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
  locale: string;
  clickCallback: (selected: string) => void;
};

export default (props: Props) => {
  const tintGold = ds.hexToRgba(ds.colours.ogcio.gold, 15);

  return (
    <ol
      className={["govie-list govie-list--spaced", styles.events].join(" ")}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
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

      <>
        {props.options.map((option) => (
          <li
            key={`lem_${option.url}`}
            tabIndex={0}
            onClick={() => {
              props.clickCallback(option.key);
            }}
          >
            <Link
              className="govie-button govie-button--icon govie-button--flat govie-button--icon govie-!-font-size-16"
              href={option.url}
              style={{
                margin: "unset",
                paddingLeft: "12px",
                width: "100%",
                display: "flex",
                justifyContent: "flex-start",
                background: props.selected.includes(option.key) ? tintGold : "",
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
      </>
    </ol>
  );
};
