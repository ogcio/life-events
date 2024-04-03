import { PgSessions } from "auth/sessions";
import ds from "design-system";

export default async () => {
  const { firstName, lastName } = await PgSessions.get();
  const name = firstName.charAt(0) + lastName.charAt(0);

  return (
    <div
      style={{
        height: 30,
        width: 30,
        fontSize: "14px",
        fontWeight: 600,
        background: ds.colours.ogcio.white,
        borderRadius: "100%",
        color: ds.colours.ogcio.darkGreen,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {name}
    </div>
  );
};
