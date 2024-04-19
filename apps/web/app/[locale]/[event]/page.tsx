export const dynamic = "force-dynamic";
export const revalidate = 0;
import MyLifeEvents from "./MyLifeEvents";
import AboutMe from "./AboutMe";

import { PgSessions } from "auth/sessions";

import { routes, web } from "../../utils";
import { notFound } from "next/navigation";
import Birth from "./Birth";
import Health from "./Health";
import Driving from "./Driving";
import Employment from "./Employment";
import StartingABusiness from "./StartingABusiness";
import Housing from "./Housing";
import Death from "./Death";
import { getAllEnabledFlags, isFeatureFlagEnabled } from "feature-flags/utils";
import { getMessages } from "next-intl/server";
import { getEnabledOptions, menuOptions } from "./components/Menu/options";
import TimelineWrapper from "./components/TimelineWrapper";
import { AbstractIntlMessages } from "next-intl";

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
};

export default async (props: web.NextPageProps) => {
  const { firstName, lastName } = await PgSessions.get();

  const userName = [firstName, lastName].join(" ");

  const Component = componentsMap[props.params.event];

  const messages = await getMessages({ locale: props.params.locale });
  const timelineMessages = messages.Timeline as AbstractIntlMessages;

  if (Component) {
    return (
      <div
        style={{
          display: "flex",
          marginTop: "1.3rem",
          gap: "2.5rem",
        }}
      >
        <TimelineWrapper messsages={timelineMessages} username={userName} />
        <Component />
      </div>
    );
  }
  throw notFound();
};
