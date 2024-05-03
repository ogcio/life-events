import { PgSessions } from "auth/sessions";
import ds from "design-system";
import styles from "./Header.module.scss";

export default async () => {
  const { firstName, lastName } = await PgSessions.get();
  const name = firstName.charAt(0) + lastName.charAt(0);

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
