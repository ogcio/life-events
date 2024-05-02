import ds from "design-system";

import Timeline from "./Timeline";
import { AbstractIntlMessages } from "next-intl";
import styles from "./SideMenu.module.scss";

type SideMenuProps = {
  username: string;
  locale: string;
  searchParams?: {
    [key: string]: string;
  };
  messages: AbstractIntlMessages;
};

export default ({
  username,
  searchParams,
  messages,
  locale,
}: SideMenuProps) => {
  const tintGold = ds.hexToRgba(ds.colours.ogcio.gold, 15);

  return (
    <ol className={`govie-list govie-list--spaced ${styles.sideMenu}`}>
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
          {username}
        </label>
      </li>
      <Timeline
        locale={locale}
        searchProps={searchParams}
        messages={messages}
      />
    </ol>
  );
};
