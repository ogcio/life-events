import ds from "design-system";
import styles from "./SideMenu.module.scss";
import { AuthenticationFactory } from "../utils/authentication-factory";

export default async () => {
  const user = await AuthenticationFactory.getInstance().getUser();
  const tintGold = ds.hexToRgba(ds.colours.ogcio.gold, 15);
  return (
    <>
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
            {user.name}
          </label>
        </li>
      </ol>
    </>
  );
};
