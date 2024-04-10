import Menu from "../components/Menu";
import AboutMe from "../components/AboutMe";

export default () => {
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
          <AboutMe />
        </div>
      </div>
    </div>
  );
};
