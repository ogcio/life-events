import { RedirectType, redirect } from "next/navigation";
import { PgSessions } from "auth/sessions";
import { NextPageProps } from "../[event]/[...action]/types";
import EventTable from "./EventTable";

export default async (props: NextPageProps) => {
  const { publicServant } = await PgSessions.get();

  if (!publicServant) {
    redirect("/", RedirectType.replace);
  }

  return <EventTable params={props.params} searchParams={props.searchParams} />;
};
