import { TimeLineData } from "./Timeline";
import MonthsCards from "./MonthsCards";

export default ({
  timeLineData,
  searchParams,
  locale,
}: {
  timeLineData: TimeLineData;
  searchParams: URLSearchParams;
  locale: string;
}) => {
  const reversedTimeLine = [...timeLineData.data].reverse();

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
                <MonthsCards
                  months={months}
                  searchParams={searchParams}
                  locale={locale}
                />
              </div>
            </div>
          );
        })}
      </ul>
    </>
  );
};
