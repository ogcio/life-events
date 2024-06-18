import { PgSessions } from "auth/sessions";
import FeatureFlagsMenu from "./FeatureFlagsMenu";
import { RedirectType, redirect } from "next/navigation";

export default async ({ children }) => {
  const { publicServant } = await PgSessions.get();

  if (!publicServant) {
    return redirect("/", RedirectType.replace);
  }

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
