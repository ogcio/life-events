import { PgSessions } from "auth/sessions";
import { redirect, RedirectType } from "next/navigation";

export default async () => {
  const { publicServant } = await PgSessions.get();

  redirect(
    publicServant ? "/send-a-message" : "/messages",
    RedirectType.replace,
  );
};
