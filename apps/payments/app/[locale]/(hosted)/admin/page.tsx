import { notFound, redirect, RedirectType } from "next/navigation";
import { routeDefinitions } from "../../../routeDefinitions";
import { PgSessions } from "auth/sessions";

export default async () => {
  const { publicServant } = await PgSessions.get();

  if (publicServant)
    return redirect(routeDefinitions.paymentSetup.slug, RedirectType.replace);

  return notFound();
};
