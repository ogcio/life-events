import { redirect, RedirectType } from "next/navigation";
import { AuthenticationFactory } from "../utils/authentication-factory";

export default async () => {
  const instance = await AuthenticationFactory.getInstance();
  const isInactivePublicServant = await instance.isInactivePublicServant();
  if (isInactivePublicServant) {
    return redirect("/inactivePublicServant", RedirectType.replace);
  }

  const isPublicServant = await instance.isPublicServant();

  redirect(isPublicServant ? "/admin" : "/messages", RedirectType.replace);
};
