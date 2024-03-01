export const dynamic = "force-dynamic";
export const revalidate = 0;
import AboutMe from "./AboutMe";
import Driving from "./Driving";
import MyLifeEvents from "./MyLifeEvents";
import { routeDefinitions } from "../../routeDefinitions";
import { PgSessions } from "auth/sessions";

import WithEventMenu from "./WithEventMenu";

type Props = {
  params: {
    event?: string;
  };
};

export default async (props: Props) => {
  let children: JSX.Element | null = null;

  const { firstName, lastName } = await PgSessions.get();
  const useName = [firstName, lastName].join(" ");

  switch (props.params.event) {
    case routeDefinitions.events.slug:
      // @ts-expect-error Async Server Component
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
    // @ts-expect-error Async Server Component
    <WithEventMenu selectedEvent={props.params.event} userName={useName}>
      {children}
    </WithEventMenu>
  );
};
