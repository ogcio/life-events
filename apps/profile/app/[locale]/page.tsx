import SideMenu from "../components/SideMenu";
import AboutMe from "../components/AboutMe";
import { NextPageProps } from "../../types";
import styles from "./page.module.scss";

export default (props: NextPageProps) => {
  return (
    <div>
      <div className={styles.pageWrapper}>
        <aside>
          <SideMenu />
        </aside>
        <main>
          <div
            className="govie-grid-column-two-thirds-from-desktop"
            style={{ width: "100%" }}
          >
            <AboutMe locale={props.params.locale} />
          </div>
        </main>
      </div>
    </div>
  );
};
