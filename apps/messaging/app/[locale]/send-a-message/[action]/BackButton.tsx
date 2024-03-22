export default ({ children }: React.PropsWithChildren) => {
  return (
    <button
      type="submit"
      style={{ background: "transparent", border: "none", cursor: "pointer" }}
      className="govie-back-link"
    >
      {children}
    </button>
  );
};
