import { createSharedPathnamesNavigation } from "next-intl/navigation";
import { locales, localePrefix } from "../../middleware";

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales, localePrefix });
