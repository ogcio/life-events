import { PgSessions } from "auth/sessions";
import { web } from "../../utils";
import Timeline from "./Timeline";
import { Timeline as TimelineClient } from "building-blocks-sdk";
import { notFound } from "next/navigation";
import { isFeatureFlagEnabled } from "feature-flags/utils";

export default async (props: web.NextPageProps) => {
  const showTimeline = await isFeatureFlagEnabled("timeline");
  if (!showTimeline) {
    throw notFound();
  }
  const { firstName, lastName, userId } = await PgSessions.get();

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

  const timelineResponse = await new TimelineClient(userId).getTimelineData(
    Object.fromEntries(queryParams),
  );
  // HANDLE ERROR
  const responseData = timelineResponse.data;

  return (
    <div
      style={{
        display: "flex",
        margin: "1.3rem 0",
        gap: "2.5rem",
      }}
    >
      {responseData && (
        <Timeline
          userName={userName}
          searchParams={queryParams}
          timeLineData={responseData}
          locale={props.params.locale}
        />
      )}
    </div>
  );
};
