import ds from "design-system";
import styles from "./Header.module.scss";
import { AuthenticationFactory } from "../utils/authentication-factory";

export default async () => {
  const user = await AuthenticationFactory.getInstance().getUser();
  const names = user.name ? user.name.split(" ") : ["N", "A"];
  const firstNameChar = names[0].charAt(0) ?? "";
  const lastNameChar = names[1] ? names[1].charAt(0) : "";
  const name = firstNameChar.concat(lastNameChar);

  return (
    <div
      className={styles.userIcon}
      style={{
        background: ds.colours.ogcio.white,
        color: ds.colours.ogcio.darkGreen,
      }}
    >
      {name}
    </div>
  );
};
