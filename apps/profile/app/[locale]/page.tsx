import Menu from "../components/Menu";
import ProfileForm from "../components/ProfileForm";

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
          <h1 className="govie-heading-l">About me</h1>
          <ProfileForm />
        </div>
      </div>
    </div>
  );
};
