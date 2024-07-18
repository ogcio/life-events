import { redirect, RedirectType } from "next/navigation";
import { routeDefinitions } from "../../routeDefinitions";
import { AuthenticationFactory } from "../../../libraries/authentication-factory";

type Props = {
  params: {
    locale: string;
  };
};

export default async (props: Props) => {
  const { isPublicServant, isInactivePublicServant } =
    await AuthenticationFactory.getInstance().getContext();

  if (isPublicServant) {
    const path = `${props.params.locale}/${routeDefinitions.paymentSetup.slug}`;
    return redirect(path, RedirectType.replace);
  }

  if (isInactivePublicServant) {
    const path = `${props.params.locale}/${routeDefinitions.inactivePublicServant.slug}`;
    return redirect(path, RedirectType.replace);
  }

  const citizenPath = `${props.params.locale}/${routeDefinitions.citizen.transactions.path()}`;
  return redirect(citizenPath, RedirectType.replace);
};
