export const dynamic = "force-dynamic";
export const revalidate = 0;
import MyLifeEvents from "./MyLifeEvents";

import { PgSessions } from "auth/sessions";

import WithEventMenu from "./WithEventMenu";
import { routes } from "../../utils";

type Props = {
  params: {
    event?: string;
  };
};

export default async (props: Props) => {
  let children: JSX.Element | null = null;

  const { firstName, lastName } = await PgSessions.get();

  const userName = [firstName, lastName].join(" ");

  switch (props.params.event) {
    case routes.events.slug:
      children = <MyLifeEvents />;
      break;

    default:
      children = <h1>Not implemented</h1>;
  }

  return (
    <WithEventMenu selectedEvent={props.params.event} userName={userName}>
      {children}
    </WithEventMenu>
  );
};
