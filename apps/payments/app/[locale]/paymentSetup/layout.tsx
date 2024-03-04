import PaymentsMenu from "./PaymentsMenu";

export default ({ children }) => {
  return (
    <div
      style={{
        display: "flex",
        marginTop: "1.3rem",
        gap: "2rem",
      }}
    >
      <PaymentsMenu />
      {children}
    </div>
  );
};
