import FeatureFlagsMenu from "./FeatureFlagsMenu";

export default async ({ children }) => {
  return (
    <div
      style={{
        display: "flex",
        marginTop: "1.3rem",
        gap: "2rem",
      }}
    >
      <FeatureFlagsMenu />
      {children}
    </div>
  );
};
