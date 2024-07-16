import { redirect, RedirectType } from "next/navigation";
import { sendAMessage } from "../../utils/routes";
import { AuthenticationFactory } from "../../utils/authentication-factory";

export default async () => {
  const isPublicServant =
    await AuthenticationFactory.getInstance().isPublicServant();

  return redirect(
    isPublicServant ? sendAMessage.url : "/messages",
    RedirectType.replace,
  );
};
