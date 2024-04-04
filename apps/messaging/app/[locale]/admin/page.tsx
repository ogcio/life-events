import { PgSessions } from "auth/sessions";
import { RedirectType, redirect } from "next/navigation";

export default async () => {
  const { publicServant } = await PgSessions.get();

  if (!publicServant) {
    redirect("/messages", RedirectType.replace);
  }

  redirect("admin/send-a-message");
};
