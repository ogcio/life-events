import { routes } from "../../../../utils";

const url = (locale: string, slug: string) => "/" + locale + "/" + slug;

type MenuOption = {
  key: string;
  icon: string;
  url: string;
  label: string;
};

export const menuOptions = [
  {
    key: "events",
    icon: "events",
    url: routes.events.slug,
    label: "Events",
  },
  {
    key: "about-me",
    icon: "about",
    url: routes.aboutMe.slug,
    label: "About me",
  },
  {
    key: "birth",
    icon: "birth",
    url: routes.birth.slug,
    label: "Birth",
  },
  {
    key: "health",
    icon: "health",
    url: routes.health.slug,
    label: "Health",
  },
  {
    key: "driving",
    icon: "driving",
    url: routes.driving.slug,
    label: "Driving",
  },
  {
    key: "employment",
    icon: "employment",
    url: routes.employment.slug,
    label: "Employment",
  },
  {
    key: "business",
    icon: "business",
    url: routes.business.slug,
    label: "Starting a business",
  },
  {
    key: "housing",
    icon: "housing",
    url: routes.housing.slug,
    label: "Housing",
  },
  {
    key: "death",
    icon: "death",
    url: routes.death.slug,
    label: "Death",
  },
];

export function getEnabledOptions(locale: string, enabledPaths: string[]) {
  const enabledOptions: MenuOption[] = [];

  for (const option of menuOptions) {
    const enabled = enabledPaths.find((ep) => ep === option.key);
    if (enabled) {
      enabledOptions.push({ ...option, url: url(locale, option.url) });
    }
  }

  return enabledOptions;
}
