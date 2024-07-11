import { redirect, RedirectType } from "next/navigation";
import { MessagingAuthenticationFactory } from "../utils/messaging";

export default async () => {
  const isPublicServant =
    await MessagingAuthenticationFactory.isPublicServant();

  redirect(isPublicServant ? "/admin" : "/messages", RedirectType.replace);
};
