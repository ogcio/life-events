import { redirect, RedirectType } from "next/navigation";
import { sendAMessage } from "../../utils/routes";
import { AuthenticationContextFactory } from "auth/authentication-context-factory";

export default async () => {
  const isPublicServant = await AuthenticationContextFactory.isPublicServant();

  return redirect(
    isPublicServant ? sendAMessage.url : "/messages",
    RedirectType.replace,
  );
};
