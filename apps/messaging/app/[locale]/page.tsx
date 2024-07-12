import { redirect, RedirectType } from "next/navigation";
import { AuthenticationFactory } from "../utils/authentication-factory";

export default async () => {
  const isPublicServant =
    await AuthenticationFactory.getInstance().isPublicServant();

  redirect(isPublicServant ? "/admin" : "/messages", RedirectType.replace);
};
