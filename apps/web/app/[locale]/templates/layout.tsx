import TemplatesMenu from "./Templates";

export default ({ children }) => {
  return (
    <div
      style={{
        display: "flex",
        marginTop: "1.3rem",
        gap: "2rem",
      }}
    >
      <TemplatesMenu />
      {children}
    </div>
  );
};
