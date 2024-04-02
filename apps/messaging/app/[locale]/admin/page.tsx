import { PgSessions } from "auth/sessions";
import { RedirectType, redirect } from "next/navigation";

export default async ({ children }: React.PropsWithChildren) => {
  const { publicServant } = await PgSessions.get();

  if (!publicServant) {
    redirect("/messages", RedirectType.replace);
  }
  return <>{children}</>;
};
