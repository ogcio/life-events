import { redirect, RedirectType } from "next/navigation";
import { routeDefinitions } from "../../routeDefinitions";
import { getPaymentsCitizenContext } from "../../../libraries/auth";

type Props = {
  params: {
    locale: string;
  };
};

export default async (props: Props) => {
  const path = `${props.params.locale}/${routeDefinitions.paymentSetup.slug}`;
  const { isPublicServant } = await getPaymentsCitizenContext();

  if (isPublicServant) return redirect(path, RedirectType.replace);

  const citizenPath = `${props.params.locale}/${routeDefinitions.citizen.transactions.path()}`;
  return redirect(citizenPath, RedirectType.replace);
};
