"use client";
import { TimeLineData } from "./Timeline";
import { useEffect, useState } from "react";
import MonthsCards from "./MonthsCards";

export default ({ timeLineData }: { timeLineData?: TimeLineData }) => {
  const [reversedTimeLine, setReversedTimeline] = useState<
    TimeLineData["data"]
  >([]);

  useEffect(() => {
    if (timeLineData?.data) {
      setReversedTimeline([...timeLineData.data].reverse());
    }
  }, [timeLineData]);

  return (
    <>
      <ul className="govie-list">
        {reversedTimeLine.map((yearData) => {
          if (!yearData) {
            return;
          }
          const { year, months } = yearData;
          return (
            <div style={{ display: "flex", gap: "2.5rem" }}>
              <div>
                <p style={{ marginTop: 0 }}>{year}</p>
              </div>
              <div style={{ flex: "1" }}>
                <MonthsCards months={months} view={"list"} />
              </div>
            </div>
          );
        })}
      </ul>
    </>
  );
};
