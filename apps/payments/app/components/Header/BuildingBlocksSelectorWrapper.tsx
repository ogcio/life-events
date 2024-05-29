import dynamic from "next/dynamic";

const DynamicBuildingBlockSelector = dynamic(
  () => import("design-system/").then((mod) => mod.BuildingBlockSelector),
  { ssr: false },
);

export default function BuildingBlockSelectorWrapper({
  locale,
}: {
  locale: string;
}) {
  return <DynamicBuildingBlockSelector locale={locale as "en" | "ga"} />;
}
