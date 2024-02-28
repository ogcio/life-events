import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import { routeDefinitions } from "../../routeDefinitions";
import { PgSessions } from "auth/sessions";
import LifeEventsMenu from "../[event]/LifeEventsMenu";

export default async () => {
  const { firstName, lastName } = await PgSessions.get();
  const useName = [firstName, lastName].join(" ");
  return (
    <LifeEventsMenu
      userName={useName}
      selected={""}
      ppsn="1234"
      options={[
        {
          key: "events",
          icon: "events",
          url: "/" + routeDefinitions.events.slug,
          label: "Events",
        },
        {
          key: "driving",
          icon: "driving",
          url: "/" + routeDefinitions.driving.slug,
          label: "Driving",
        },
      ]}
    />
  );
};
