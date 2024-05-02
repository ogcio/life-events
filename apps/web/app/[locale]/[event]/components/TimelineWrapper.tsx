import ds from "design-system";

import Timeline from "./Timeline";
import { AbstractIntlMessages } from "next-intl";
import { PgSessions } from "auth/sessions";

type TimelineWrapperProps = {
  locale: string;
  searchParams?: {
    [key: string]: string;
  };
  messages: AbstractIntlMessages;
};

export default async ({
  searchParams,
  messages,
  locale,
}: TimelineWrapperProps) => {
  const tintGold = ds.hexToRgba(ds.colours.ogcio.gold, 15);
  const { firstName, lastName, userId } = await PgSessions.get();

  const username = [firstName, lastName].join(" ");

  return (
    <ol
      className="govie-list govie-list--spaced"
      style={{
        width: "200px",
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
          {username}
        </label>
      </li>
      <Timeline
        userId={userId}
        locale={locale}
        searchProps={searchParams}
        messages={messages}
      />
    </ol>
  );
};
