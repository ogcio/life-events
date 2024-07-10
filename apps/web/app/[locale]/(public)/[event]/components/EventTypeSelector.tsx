"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

/**
 * this is the only client component for search,
 * we don't know yet if we are going to need it to work with no js,
 * so it would be cumbersome to have both a js/non js solution as of now
 * we can change it in the future if ever need to
 */
type EventTypeSelector = {
  searchProps?: {
    [key: string]: string;
  };
};

export default ({ searchProps }: EventTypeSelector) => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  const selectedValue = searchProps?.services || "";

  const handleChange = (e: { target: { value: string } }) => {
    const newSearchParams = new URLSearchParams(searchProps);
    newSearchParams.set("services", e.target.value.toLowerCase());
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  return (
    <select
      className="govie-select"
      id="default-select"
      name="default-select"
      style={{ minWidth: "initial", width: "100%" }}
      onChange={handleChange}
      value={selectedValue}
    >
      <option value="">{t("allServices")}</option>
      <option value="driving">{t("driving")}</option>
      <option value="employment">{t("employment")}</option>
      <option value="housing">{t("housing")}</option>
    </select>
  );
};
