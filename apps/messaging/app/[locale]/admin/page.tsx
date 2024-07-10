import { redirect, RedirectType } from "next/navigation";
import { sendAMessage } from "../../utils/routes";
import { MessagingAuthenticationFactory } from "../../utils/messaging";

export default async () => {
  const isPublicServant =
    await MessagingAuthenticationFactory.isPublicServant();

  return redirect(
    isPublicServant ? sendAMessage.url : "/messages",
    RedirectType.replace,
  );
};
