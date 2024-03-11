import { PgSessions } from "auth/sessions";
import LifeEventsMenu from "../[event]/LifeEventsMenu";
import { routes } from "../../utils";

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
          url: "/" + routes.events.slug,
          label: "Events",
        },
        {
          key: "driving",
          icon: "driving",
          url: "/" + routes.driving.slug,
          label: "Driving",
        },
      ]}
    />
  );
};
