import Menu from "./Menu";
import Link from "next/link";
import TimeLineGrid from "./TimeLineGrid";
import TimeLineList from "./TimeLineList";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";

type Event = {
  service: string;
  date: string;
  title: string;
  description: string;
  weight: number;
};

export type Month = {
  month: string;
  events: Event[];
};

export type TimeLineData = {
  minYear: number;
  maxYear: number;
  data: {
    year: number;
    minYear: number;
    maxYear: number;
    months: Month[];
  }[];
};

export type GroupedEvents = {
  [service: string]: Event[];
};

export default async ({
  userName,
  searchParams,
  timeLineData,
  locale,
}: {
  userName: string;
  searchParams: URLSearchParams;
  timeLineData: TimeLineData;
  locale: string;
}) => {
  const t = await getTranslations("Timeline");
  const path = headers().get("x-pathname")?.toString() || "";

  const showGrid = searchParams.get("viewMode") === "grid";

  return (
    <>
      <div>
        <Menu userName={userName} searchParams={searchParams} locale={locale} />
      </div>
      <div style={{ width: "100%" }}>
        <div style={{ textAlign: "right" }}>
          <p className="govie-body-s">
            {t("view")}:{" "}
            <ViewButton
              label={t("list")}
              searchParams={searchParams}
              mode={"list"}
              path={path}
            />{" "}
            |{" "}
            <ViewButton
              label={t("grid")}
              searchParams={searchParams}
              mode={"grid"}
              path={path}
            />
          </p>
        </div>

        {showGrid ? (
          <TimeLineGrid
            timeLineData={timeLineData}
            searchParams={searchParams}
            locale={locale}
          />
        ) : (
          <TimeLineList
            timeLineData={timeLineData}
            searchParams={searchParams}
            locale={locale}
          />
        )}
      </div>
    </>
  );
};

const ViewButton = ({
  searchParams,
  label,
  mode,
  path,
}: {
  searchParams: URLSearchParams;
  label: string;
  mode: "grid" | "list";
  path: string;
}) => {
  const newSearchParams = new URLSearchParams(searchParams);
  newSearchParams.set("viewMode", mode);
  return (
    <Link href={`${path}?${newSearchParams.toString()}`} className="govie-link">
      {label}
    </Link>
  );
};
