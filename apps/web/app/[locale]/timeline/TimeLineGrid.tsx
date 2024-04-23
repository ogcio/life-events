import ds from "design-system";
import dayjs from "dayjs";
import NavButton from "./NavButton";
import { TimeLineData } from "./Timeline";
import MonthsCards from "./MonthsCards";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";

const grey = ds.hexToRgba(ds.colours.ogcio.darkGrey, 30);

type TimeLineGridProps = {
  timeLineData: TimeLineData;
  searchParams: URLSearchParams;
};

export default async ({ timeLineData, searchParams }: TimeLineGridProps) => {
  const t = await getTranslations("Timeline");

  const data = timeLineData.data || [];

  const path = headers().get("x-pathname")?.toString();

  let referenceYearString = searchParams.get("referenceYear");
  let referenceYear = Number(referenceYearString);
  if (isNaN(referenceYear)) {
    referenceYear = data[data.length - 2].year;
  }

  const referenceYearIndex = data.findIndex(
    ({ year }) => year === referenceYear,
  );

  const visibleYearsData =
    referenceYearIndex !== -1
      ? [
          data[referenceYearIndex - 1],
          data[referenceYearIndex],
          data[referenceYearIndex + 1],
        ]
      : [data[data.length - 3], data[data.length - 2], data[data.length - 1]];

  const prevButtonsSearchParams = new URLSearchParams(searchParams);
  let prevButtonEnabled = false;
  if (
    visibleYearsData[0]?.year &&
    visibleYearsData[0].year > timeLineData?.minYear
  ) {
    prevButtonEnabled = true;
    prevButtonsSearchParams.set("referenceYear", `${visibleYearsData[0].year}`);
  }

  const nexButtonSearchParams = new URLSearchParams(searchParams);
  let nextButtonEnabled = false;

  if (
    visibleYearsData[2]?.year &&
    visibleYearsData[2].year < timeLineData?.maxYear
  ) {
    nextButtonEnabled = true;
    nexButtonSearchParams.set("referenceYear", `${visibleYearsData[2].year}`);
  }

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
              disabled={!prevButtonEnabled}
              transform={false}
              url={`${path}?${prevButtonsSearchParams.toString()}`}
            />
          </div>
        </div>
        {visibleYearsData?.map((yearData) => {
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
              <MonthsCards
                months={months}
                view={"grid"}
                searchParams={searchParams}
              />
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
              disabled={!nextButtonEnabled}
              url={`${path}?${nexButtonSearchParams.toString()}`}
              transform={true}
            />
          </div>
        </div>
      </div>
    </>
  );
};
