import { RedirectType, redirect } from "next/navigation";
import { PgSessions } from "auth/sessions";
import EventTable from "./EventTable";
import { web } from "../../utils";

export default async (props: web.NextPageProps) => {
  const { publicServant } = await PgSessions.get();

  if (!publicServant) {
    redirect("/", RedirectType.replace);
  }

  return <EventTable params={props.params} searchParams={props.searchParams} />;
};
