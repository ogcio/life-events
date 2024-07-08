import ds from "design-system";
import { getAuthenticationContext } from "./logto_integration/config";

export default async () => {
  const { user } = await getAuthenticationContext();
  const names = user.name ? user.name.split(" ") : ["N", "A"];
  const firstNameChar = names[0].charAt(0) ?? "";
  const lastNameChar = names[1] ? names[1].charAt(0) : "";
  const name = firstNameChar.concat(lastNameChar);

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
