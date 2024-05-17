import Link from "next/link";
import ds from "design-system";
import styles from "./HamburgerMenu.module.scss";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

const Icon = ds.Icon;

type IconProps = React.ComponentProps<typeof ds.Icon>;

type MenuProps = {
  userName: string;
  publicServant: boolean;
  handleClick: () => void;
};

const options = [
  {
    icon: "payments",
    url: "/paymentSetup",
    label: "payments",
  },
  {
    icon: "payments",
    url: "/paymentSetup/requests",
    label: "paymentRequests",
  },
  {
    icon: "providers",
    url: "/paymentSetup/providers",
    label: "providers",
  },
];

const tintGold = ds.hexToRgba(ds.colours.ogcio.gold, 15);

export default ({ userName, publicServant, handleClick }: MenuProps) => {
  const t = useTranslations();

  const pathname = usePathname();
  const pathSplitted = pathname.split("/");
  const locale = pathSplitted[1];
  const pathSlice = pathSplitted.slice(2).join("/");

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
        {publicServant &&
          options.map((option) => {
            const optionUrl = `/${locale}${option.url}`;
            return (
              <li key={option.url} tabIndex={0} onClick={() => handleClick()}>
                <Link
                  className={`govie-button govie-button--icon govie-button--flat govie-button--icon govie-!-font-size-16 ${styles.menuLink}`}
                  style={{
                    background: pathname === optionUrl ? tintGold : "",
                  }}
                  href={optionUrl}
                >
                  <Icon
                    icon={option.icon as IconProps["icon"]}
                    className="govie-button__icon-left"
                    color={ds.colours.ogcio.darkGreen}
                  />
                  {t(option.label)}
                </Link>
              </li>
            );
          })}
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
            Gaelic
          </Link>
        </div>
      </>
    </ol>
  );
};
