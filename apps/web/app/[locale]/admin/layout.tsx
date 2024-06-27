import { PgSessions } from "auth/sessions";
import { RedirectType, redirect } from "next/navigation";

export default async ({ children }) => {
  const { publicServant } = await PgSessions.get();

  if (!publicServant) {
    return redirect("/", RedirectType.replace);
  }

  return children;
};
