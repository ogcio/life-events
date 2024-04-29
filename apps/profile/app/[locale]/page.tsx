import Menu from "../components/Menu";
import AboutMe from "../components/AboutMe";
import { NextPageProps } from "../../types";

export default (props: NextPageProps) => {
  return (
    <div>
      <div
        style={{
          display: "flex",
          margin: "1.3rem 0",
          gap: "2.5rem",
        }}
      >
        <Menu />
        <div className="govie-grid-column-two-thirds-from-desktop">
          <AboutMe locale={props.params.locale} />
        </div>
      </div>
    </div>
  );
};
