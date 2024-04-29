import { redirect, RedirectType } from "next/navigation";
import { routeDefinitions } from "../../routeDefinitions";
import { PgSessions } from "auth/sessions";

type Props = {
  params: {
    locale: string;
  };
};

export default async (props: Props) => {
  const path = `${props.params.locale}/${routeDefinitions.paymentSetup.slug}`;
  const { publicServant } = await PgSessions.get();

  if (publicServant) return redirect(path, RedirectType.replace);

  const citizenPath = `${props.params.locale}/${routeDefinitions.citizen.transactions.path()}`;
  return redirect(citizenPath, RedirectType.replace);
};
