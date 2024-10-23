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
  languageSwitch: React.ReactNode;
  logout: React.ReactNode;
};

const tintGold = ds.hexToRgba(ds.colours.ogcio.gold, 15);

export default ({
  userName,
  publicServant,
  handleClick,
  languageSwitch,
  logout,
}: MenuProps) => {
  const t = useTranslations();

  const pathname = usePathname();
  const pathSplitted = pathname.split("/");
  const locale = pathSplitted[1];

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
        {logout}
        {languageSwitch}
      </>
    </ol>
  );
};
