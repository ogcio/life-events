import { PgSessions } from "auth/sessions";
import { web } from "../../utils";
import Timeline, { TimeLineData } from "./Timeline";
import getTimelineData from "../../data/getTimelineData";
import { notFound } from "next/navigation";
import { isFeatureFlagEnabled } from "feature-flags/utils";

export default async (props: web.NextPageProps) => {
  const showTimeline = await isFeatureFlagEnabled("timeline");
  if (!showTimeline) {
    throw notFound();
  }
  const { firstName, lastName } = await PgSessions.get();

  const userName = [firstName, lastName].join(" ");

  const queryParams = new URLSearchParams(props.searchParams);
  if (!queryParams.get("startData")) {
    queryParams.set("startDate", "2018-01-01");
  }

  if (!queryParams.get("endDate")) {
    queryParams.set("endDate", "2025-12-31");
  }

  if (!queryParams.get("services")) {
    queryParams.set("services", ["driving", "employment", "housing"].join(","));
  }

  if (!queryParams.get("searchQuery")) {
    queryParams.set("searchQuery", "");
  }

  const timelineResponse = await getTimelineData(queryParams);

  // HANDLE ERROR
  const responseData: TimeLineData = await timelineResponse.json();

  return (
    <div
      style={{
        display: "flex",
        margin: "1.3rem 0",
        gap: "2.5rem",
      }}
    >
      <Timeline
        userName={userName}
        searchParams={queryParams}
        timeLineData={responseData}
        locale={props.params.locale}
      />
    </div>
  );
};
