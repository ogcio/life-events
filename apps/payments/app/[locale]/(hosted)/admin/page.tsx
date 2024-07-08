import { notFound, redirect, RedirectType } from "next/navigation";
import { routeDefinitions } from "../../../routeDefinitions";
import { getPaymentsOrganizationContext } from "../../../../libraries/auth";

export default async () => {
  const { isPublicServant } = await getPaymentsOrganizationContext();

  if (!isPublicServant) return notFound();

  return redirect(routeDefinitions.paymentSetup.slug, RedirectType.replace);
};
