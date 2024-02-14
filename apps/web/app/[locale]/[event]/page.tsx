export const dynamic = "force-dynamic";
export const revalidate = 0;
import AboutMe from "./AboutMe";
import Driving from "./Driving";
import MyLifeEvents from "./MyLifeEvents";
import { routeDefinitions } from "../../routeDefinitions";
import { PgSessions } from "../../sessions";

import WithEventMenu from "./WithEventMenu";
import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";

type Props = {
  params: {
    event?: string;
  };
};

export default async (props: Props) => {
  let children: JSX.Element | null = null;

  const sessionId = cookies().get("sessionId")?.value;
  if (!sessionId) {
    return redirect("/logout", RedirectType.replace);
  }

  const session = await PgSessions.get(sessionId);

  if (!session) {
    return redirect("/logout", RedirectType.replace);
  }

  const { firstName, lastName } = PgSessions.utils.decodeJwt(session.token);
  const useName = [firstName, lastName].join(" ");

  switch (props.params.event) {
    case routeDefinitions.events.slug:
      children = <MyLifeEvents />;
      break;
    case routeDefinitions.aboutMe.slug:
      children = <AboutMe />;
      break;
    case routeDefinitions.driving.slug:
      children = <Driving />;
      break;

    default:
      children = <div>TODO: Not found component</div>;
  }

  return (
    <WithEventMenu selectedEvent={props.params.event} userName={useName}>
      {children}
    </WithEventMenu>
  );
};
