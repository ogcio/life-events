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
  // const { publicServant } = await PgSessions.get();

  // if (publicServant) return redirect(path, RedirectType.replace);

  //TODO: Build the citizen homepage content
  return <h1>Welcome citizen...</h1>;
};
