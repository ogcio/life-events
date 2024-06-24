import { PgSessions } from "auth/sessions";
import { RedirectType, redirect } from "next/navigation";

export default async (locale: string) => {
  const { publicServant } = await PgSessions.get();
  if (publicServant) {
    redirect(`/${locale}/admin`, RedirectType.replace);
  }
};
