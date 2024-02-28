import LifeEventsMenu from "./LifeEventsMenu";
import { routeDefinitions } from "../../routeDefinitions";
import { getFeatureFlag } from "feature-flags/utils";

/**
 * If a path from an event continues (not final), we can't use the menu in a next layout
 * component due to the deeper "slug" path doesn't have the menu per design.
 *
 * The layout at the event level in a /[event]/[action]/... path heirarchy wouldn't know
 * about the action and thus unable to determine wether to show the menu or not.
 */

export default async function WithEventMenu({
  children,
  selectedEvent,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
  selectedEvent?: string;
}) {
  const eventsFeatureFlag = await getFeatureFlag("portal", "events");
  return (
    <div
      style={{
        display: "flex",
        marginTop: "1.3rem",
        gap: "2rem",
      }}
    >
      <div>
        <LifeEventsMenu
          userName={userName}
          ppsn="TUV1234123"
          selected={selectedEvent ?? ""}
          options={[
            ...(eventsFeatureFlag?.is_enabled
              ? [
                  {
                    key: "events",
                    icon: "events",
                    url: "/" + routeDefinitions.events.slug,
                    label: "Events",
                  },
                ]
              : []),
            {
              key: "about-me",
              icon: "about",
              url: "/" + routeDefinitions.aboutMe.slug,
              label: "About me",
            },

            { key: "birth", icon: "birth", url: "/birth", label: "Birth" },
            { key: "health", icon: "health", url: "/health", label: "Health" },
            {
              key: "driving",
              icon: "driving",
              url: "/" + routeDefinitions.driving.slug,
              label: "Driving",
            },
            {
              key: "employment",
              icon: "employment",
              url: "/employment",
              label: "Employment",
            },
            {
              key: "business",
              icon: "business",
              url: "/business",
              label: "Starting a business",
            },
            {
              key: "housing",
              icon: "housing",
              url: "/housing",
              label: "Housing",
            },
            { key: "death", icon: "death", url: "/death", label: "Death" },
          ]}
        />
      </div>
      {children}
    </div>
  );
}
