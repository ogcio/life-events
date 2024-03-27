import { routes, web } from "../../../utils";
import LifeEventsMenu from "./LifeEventsMenu";
import { isFeatureFlagEnabled } from "feature-flags/utils";

type MenuOption = {
  key: string;
  icon: string;
  url: string;
  label: string;
};

/**
 * If a path from an event continues (not final), we can't use the menu in a next layout
 * component due to the deeper "slug" path doesn't have the menu per design.
 *
 * The layout at the event level in a /[event]/[action]/... path heirarchy wouldn't know
 * about the action and thus unable to determine wether to show the menu or not.
 */

// Note: it is very likely this component is getting removed. /Ludwig 8th march 2024
export default async function WithEventMenu({
  children,
  userName,
  params,
}: {
  children: React.ReactNode;
  userName: string;
  params: web.NextPageProps["params"];
}) {
  const url = (slug: string) => "/" + params.locale + "/" + slug;

  const menuOptions = [
    {
      key: "events",
      icon: "events",
      url: url(routes.events.slug),
      label: "Events",
    },
    {
      key: "about-me",
      icon: "about",
      url: url(routes.aboutMe.slug),
      label: "About me",
    },
    {
      key: "birth",
      icon: "birth",
      url: url(routes.birth.slug),
      label: "Birth",
    },
    {
      key: "health",
      icon: "health",
      url: url(routes.health.slug),
      label: "Health",
    },
    {
      key: "driving",
      icon: "driving",
      url: url(routes.driving.slug),
      label: "Driving",
    },
    {
      key: "employment",
      icon: "employment",
      url: url(routes.employment.slug),
      label: "Employment",
    },
    {
      key: "business",
      icon: "business",
      url: url(routes.business.slug),
      label: "Starting a business",
    },
    {
      key: "housing",
      icon: "housing",
      url: url(routes.housing.slug),
      label: "Housing",
    },
    {
      key: "death",
      icon: "death",
      url: url(routes.death.slug),
      label: "Death",
    },
  ];

  async function getEnabledOptions() {
    const enabledOptions: MenuOption[] = [];

    for (const option of menuOptions) {
      const enabled = await isFeatureFlagEnabled(option.key);
      if (enabled) {
        enabledOptions.push(option);
      }
    }

    return enabledOptions;
  }
  const enabledOptions = await getEnabledOptions();

  return (
    <div
      style={{
        display: "flex",
        marginTop: "1.3rem",
        gap: "2.5rem",
      }}
    >
      <div>
        <LifeEventsMenu
          userName={userName}
          ppsn="TUV1234123"
          selected={params.event ?? ""}
          options={enabledOptions}
        />
      </div>
      {children}
    </div>
  );
}
