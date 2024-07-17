import { redirect, RedirectType } from "next/navigation";
import { AuthenticationFactory } from "../utils/authentication-factory";

export default async () => {
  const isInactivePublicServant =
    await AuthenticationFactory.getInstance().isInactivePublicServant();
  if (isInactivePublicServant) {
    return redirect("/inactivePublicServant", RedirectType.replace);
  }

  const isPublicServant =
    await AuthenticationFactory.getInstance().isPublicServant();

  redirect(isPublicServant ? "/admin" : "/messages", RedirectType.replace);
};
