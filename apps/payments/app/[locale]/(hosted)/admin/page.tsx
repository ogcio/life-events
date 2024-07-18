import { notFound, redirect, RedirectType } from "next/navigation";
import { routeDefinitions } from "../../../routeDefinitions";
import { AuthenticationFactory } from "../../../../libraries/authentication-factory";

export default async () => {
  const isPublicServant =
    await AuthenticationFactory.getInstance().isPublicServant();

  if (!isPublicServant) return notFound();

  return redirect(routeDefinitions.paymentSetup.slug, RedirectType.replace);
};
