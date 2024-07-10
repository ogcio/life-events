import { redirect, RedirectType } from "next/navigation";
import { AuthenticationContextFactory } from "auth/authentication-context-factory";

export default async () => {
  const isPublicServant = await AuthenticationContextFactory.isPublicServant();

  redirect(isPublicServant ? "/admin" : "/messages", RedirectType.replace);
};
