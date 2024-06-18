import Link from "next/link";
import ds from "design-system";
import styles from "./HamburgerMenu.module.scss";
import { useTranslations } from "next-intl";

const Icon = ds.Icon;

type IconProps = React.ComponentProps<typeof ds.Icon>;

type Props = {
  options: {
    key: string;
    url: string;
    icon: string;
    label: string;
  }[];
  selected: string;
  userName: string;
  locale: string;
  path?: string;
  clickCallback: (selected: string) => void;
};

export default ({
  options,
  selected,
  userName,
  locale,
  clickCallback,
  path,
}: Props) => {
  const t = useTranslations();
  const tintGold = ds.hexToRgba(ds.colours.ogcio.gold, 15);
  const pathSlice = path?.split("/").slice(2).join("/") || "";

  return (
    <ol className={`govie-list govie-list--spaced ${styles.hamburgerMenu}`}>
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
          {userName}
        </label>
      </li>

      <>
        {options.map((option) => (
          <li
            key={`lem_${option.url}`}
            tabIndex={0}
            onClick={() => {
              clickCallback(option.key);
            }}
          >
            <Link
              className={`govie-button govie-button--icon govie-button--flat govie-button--icon govie-!-font-size-16 ${styles.menuLink}`}
              style={{
                background: selected.includes(option.key) ? tintGold : "",
              }}
              href={option.url}
            >
              <Icon
                icon={option.icon as IconProps["icon"]}
                className="govie-button__icon-left"
                color={ds.colours.ogcio.darkGreen}
              />
              {option.label}
            </Link>
          </li>
        ))}
        <div className={styles.logoutContainer}>
          <Link
            href="/logout"
            prefetch={false}
            className={`govie-button govie-button--icon govie-button--flat govie-button--icon govie-!-font-size-16 ${styles.menuLink}`}
          >
            <ds.Icon
              icon="logout"
              className="govie-button__icon-left"
              color={ds.colours.ogcio.darkGreen}
            />
            {t("logout")}
          </Link>
        </div>
        <div className={styles.languagesContainer}>
          <Link
            className={`govie-link govie-link--no-underline`}
            style={{
              fontWeight: locale === "en" ? "bold" : "normal",
              color: ds.colours.ogcio.darkGreen,
            }}
            href={"/en/" + pathSlice}
            prefetch={false}
          >
            English
          </Link>
          <div
            style={{
              height: "14px",
              width: "1px",
              borderLeft: `1px solid ${ds.colours.ogcio.darkGreen}`,
            }}
          />

          <Link
            className={`govie-link govie-link--no-underline`}
            style={{
              fontWeight: locale === "ga" ? "bold" : "normal",
              color: ds.colours.ogcio.darkGreen,
            }}
            href={"/ga/" + pathSlice}
            prefetch={false}
          >
            Gaeilge
          </Link>
        </div>
      </>
    </ol>
  );
};
