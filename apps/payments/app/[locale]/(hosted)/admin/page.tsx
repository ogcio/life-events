import { notFound, redirect, RedirectType } from "next/navigation";
import { routeDefinitions } from "../../../routeDefinitions";
import { getPaymentsPublicServantContext } from "../../../../libraries/auth";

export default async () => {
  const { isPublicServant } = await getPaymentsPublicServantContext();

  if (!isPublicServant) return notFound();

  return redirect(routeDefinitions.paymentSetup.slug, RedirectType.replace);
};
