import { redirect, RedirectType } from "next/navigation";
import { AuthenticationContextFactory } from "auth/authentication-context-factory";
import { withContext } from "./with-context";

export default withContext(async () => {
  const isPublicServant = await AuthenticationContextFactory.isPublicServant();

  redirect(isPublicServant ? "/admin" : "/messages", RedirectType.replace);
});
