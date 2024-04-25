"use client";
import ds from "design-system";
import dayjs from "dayjs";
import NavButton from "./NavButton";
import { TimeLineData } from "./Timeline";
import { useEffect, useState } from "react";
import MonthsCards from "./MonthsCards";

const grey = ds.hexToRgba(ds.colours.ogcio.darkGrey, 30);

export default ({
  timeLineData,
  locale,
}: {
  timeLineData?: TimeLineData;
  locale: string;
}) => {
  const data = timeLineData?.data || [];
  const [visibleYears, setVisibleYears] = useState<TimeLineData["data"]>([]);

  useEffect(() => {
    if (timeLineData?.data) {
      const { data } = timeLineData;
      setVisibleYears([
        data[data.length - 3],
        data[data.length - 2],
        data[data.length - 1],
      ]);
    }
  }, [timeLineData]);

  const goBack = () => {
    const currentIndex = data.findIndex((year) => year === visibleYears[0]);
    if (currentIndex > 0) {
      setVisibleYears([
        data[currentIndex - 1],
        data[currentIndex],
        data[currentIndex + 1],
      ]);
    }
  };

  const goForward = () => {
    const currentIndex = data.findIndex((year) => year === visibleYears[2]);
    if (currentIndex < data.length - 1) {
      setVisibleYears([
        data[currentIndex - 1],
        data[currentIndex],
        data[currentIndex + 1],
      ]);
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          columnGap: "20px",
          minHeight: "100%",
          minWidth: "100%",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "40px",
          }}
        >
          <div style={{ height: "25px" }}>
            <NavButton
              disabled={
                visibleYears[0]?.year
                  ? visibleYears[0]?.year === timeLineData?.minYear
                  : true
              }
              onClick={() => goBack()}
              transform={false}
            />
          </div>
        </div>
        {visibleYears?.map((yearData) => {
          if (!yearData) {
            return;
          }
          const { year, months } = yearData;
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                padding: "0 10px",
                borderLeft:
                  year === dayjs().year() ? `1px solid ${grey}` : "none",
                borderRight:
                  year === dayjs().year() ? `1px solid ${grey}` : "none",
                flex: 1,
              }}
              key={yearData.year}
            >
              <div>
                <p
                  className="govie-body"
                  style={{ textAlign: "center", marginBottom: 0 }}
                >
                  {year === dayjs().year() ? <strong>{year}</strong> : year}
                </p>
              </div>
              <MonthsCards months={months} view={"grid"} locale={locale} />
            </div>
          );
        })}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            width: "40px",
          }}
        >
          <div style={{ height: "25px" }}>
            <NavButton
              disabled={
                visibleYears[visibleYears.length - 1]?.year
                  ? visibleYears[visibleYears.length - 1].year ===
                    timeLineData?.maxYear
                  : true
              }
              onClick={() => goForward()}
              transform={true}
            />
          </div>
        </div>
      </div>
    </>
  );
};
