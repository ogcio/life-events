import { PgSessions } from "auth/sessions";
import ds from "design-system";

export default async () => {
  const { firstName, lastName } = await PgSessions.get();
  const userName = [firstName, lastName].join(" ");
  const tintGold = ds.hexToRgba(ds.colours.ogcio.gold, 15);
  return (
    <>
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
            {userName}
          </label>
        </li>
      </ol>
    </>
  );
};
