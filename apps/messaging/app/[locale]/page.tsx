import { redirect, RedirectType } from "next/navigation";
import { getAuthenticationContext } from "./logto_integration/config";

export default async () => {
  const { isPublicServant } = await getAuthenticationContext();

  redirect(isPublicServant ? "/admin" : "/messages", RedirectType.replace);
};
