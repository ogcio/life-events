import { redirect, RedirectType } from "next/navigation";
import { routes } from "../utils";
import { PgSessions } from "auth/sessions";

type Props = {
  params: {
    locale: string;
  };
};

export default async (props: Props) => {
  const path = `${props.params.locale}/${routes.events.slug}`;

  const { publicServant } = await PgSessions.get();
  if (publicServant) {
    redirect(`${props.params.locale}/admin`, RedirectType.replace);
  }

  redirect(path, RedirectType.replace);
};
