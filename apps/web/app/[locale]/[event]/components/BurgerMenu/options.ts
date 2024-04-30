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
    label: "events",
  },
  {
    key: "about-me",
    icon: "about",
    url: routes.aboutMe.slug,
    label: "aboutMe",
  },
  {
    key: "birth",
    icon: "birth",
    url: routes.birth.slug,
    label: "birth",
  },
  {
    key: "health",
    icon: "health",
    url: routes.health.slug,
    label: "health",
  },
  {
    key: "driving",
    icon: "driving",
    url: routes.driving.slug,
    label: "driving",
  },
  {
    key: "employment",
    icon: "employment",
    url: routes.employment.slug,
    label: "employment",
  },
  {
    key: "business",
    icon: "business",
    url: routes.business.slug,
    label: "business",
  },
  {
    key: "housing",
    icon: "housing",
    url: routes.housing.slug,
    label: "housing",
  },
  {
    key: "death",
    icon: "death",
    url: routes.death.slug,
    label: "death",
  },
];

export function getEnabledOptions(
  locale: string,
  enabledPaths: string[],
  t: (key: string) => string,
) {
  const enabledOptions: MenuOption[] = [];

  for (const option of menuOptions) {
    const enabled = enabledPaths.find((ep) => ep === option.key);
    if (enabled) {
      enabledOptions.push({
        ...option,
        url: url(locale, option.url),
        label: t(option.label),
      });
    }
  }

  return enabledOptions;
}
