export const dynamic = "force-dynamic";
export const revalidate = 0;
import MyLifeEvents from "./MyLifeEvents";
import AboutMe from "./AboutMe";

import { PgSessions } from "auth/sessions";

import WithEventMenu from "./components/WithEventMenu";
import { routes, web } from "../../utils";
import { notFound } from "next/navigation";
import Birth from "./Birth";
import Health from "./Health";
import Driving from "./Driving";
import Employment from "./Employment";
import StartingABusiness from "./StartingABusiness";
import Housing from "./Housing";
import Death from "./Death";
import ExpandedTimeline from "./components/ExpandedTimeline";

const componentsMap = {
  [routes.events.slug]: MyLifeEvents,
  [routes.aboutMe.slug]: AboutMe,
  [routes.birth.slug]: Birth,
  [routes.health.slug]: Health,
  [routes.driving.slug]: Driving,
  [routes.employment.slug]: Employment,
  [routes.business.slug]: StartingABusiness,
  [routes.housing.slug]: Housing,
  [routes.death.slug]: Death,
  [routes.timeline.slug]: ExpandedTimeline,
};

export default async (props: web.NextPageProps) => {
  const { firstName, lastName } = await PgSessions.get();

  const userName = [firstName, lastName].join(" ");

  const Component = componentsMap[props.params.event];

  if (Component) {
    return (
      <WithEventMenu params={props.params} userName={userName}>
        <Component />
      </WithEventMenu>
    );
  }
  throw notFound();
};
