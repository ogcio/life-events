"use client";
import { useEffect, useState } from "react";
import { formatDate } from "../../utils/web";
import ds from "design-system";
import { debounce } from "lodash";
import dayjs from "dayjs";
import Menu from "./Menu";
import Link from "next/link";
import NavButton from "./NavButton";

const Icon = ds.Icon;

export type TimeLineData = {
  year: number;
  months: {
    month: string;
    events: {
      category: string;
      date: Date;
      title: string;
      description: string;
      dismissable?: boolean;
      detailsLink?: string;
    }[];
  }[];
};

const tintGold = ds.hexToRgba(ds.colours.ogcio.gold, 15);
const opaque = ds.hexToRgba(ds.colours.ogcio.gold, 5);
const grey = ds.hexToRgba(ds.colours.ogcio.darkGrey, 30);
const minYear = 2021;
const maxYear = 2029;

export default ({ userName }: { userName: string }) => {
  const [dates, setDates] = useState({
    startDate: dayjs().subtract(1, "year").format("YYYY"),
    endDate: dayjs().add(4, "year").format("YYYY"),
  });
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeLineData, setTimeLineData] = useState<TimeLineData[]>([]);

  const fetchTimelineData = async () => {
    const queryParams = new URLSearchParams({
      startDate: dates.startDate,
      endDate: dates.endDate,
      category,
      searchQuery,
    });

    const timelineResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/timeline/?${queryParams}`,
    );

    const responseData = await timelineResponse.json();

    setTimeLineData(responseData.reverse());
  };

  useEffect(() => {
    fetchTimelineData();
  }, []);

  useEffect(() => {
    fetchTimelineData();
  }, [category, searchQuery, dates]);

  const handleCategoryChange = (selectedCategory: string) => {
    if (selectedCategory.toLowerCase() === category) {
      setCategory("all");
    } else {
      setCategory(selectedCategory.toLowerCase());
    }
  };

  const handleSearchChangeDebounced = debounce((value) => {
    setSearchQuery(value);
  }, 300);

  const handleSearchChange = (value) => {
    handleSearchChangeDebounced(value);
  };

  const goBack = () => {
    setDates((prevDates) => ({
      startDate: (parseInt(prevDates.startDate) - 1).toString(),
      endDate: (parseInt(prevDates.endDate) - 1).toString(),
    }));
  };

  const goForward = () => {
    setDates((prevDates) => ({
      startDate: (parseInt(prevDates.startDate) + 1).toString(),
      endDate: (parseInt(prevDates.endDate) + 1).toString(),
    }));
  };

  return (
    <>
      <div>
        <Menu
          userName={userName}
          handleSearchChange={handleSearchChange}
          handleCategoryChange={handleCategoryChange}
        />
      </div>
      <div>
        {!timeLineData.length ? (
          <p className="govie-body">Events not found</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "40px 1fr 1fr 1fr 1fr 1fr 40px",
              columnGap: "20px",
              minHeight: "100%",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ height: "25px" }}>
                <NavButton
                  disabled={dayjs(dates.startDate).year() === minYear}
                  onClick={() => goBack()}
                  transform={false}
                />
              </div>
            </div>
            {timeLineData.map((yearData) => {
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
                  {months.map((monthObject) => {
                    const { events } = monthObject;
                    return (
                      <>
                        {events.map((event) => {
                          return (
                            <div
                              style={{
                                backgroundColor: dayjs(event.date).isBefore(
                                  dayjs(),
                                )
                                  ? opaque
                                  : tintGold,
                                padding: "12px",
                              }}
                            >
                              <Icon
                                icon={event.category}
                                className="govie-button__icon-left"
                                color={ds.colours.ogcio.darkGreen}
                              />
                              <p
                                className="govie-body govie-!-font-size-16"
                                style={{ marginBottom: 0 }}
                              >
                                <strong>{formatDate(event.date)}</strong>
                              </p>
                              <p className="govie-body govie-!-font-size-16">
                                {event.title}
                              </p>
                              {event.dismissable && (
                                <div style={{ textAlign: "right" }}>
                                  <Link href="/dismiss" className="govie-link">
                                    <span>Dismiss</span>
                                  </Link>
                                </div>
                              )}
                              {event.detailsLink && (
                                <div style={{ textAlign: "right" }}>
                                  <Link href="/details" className="govie-link">
                                    <span>View details</span>
                                  </Link>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </>
                    );
                  })}
                </div>
              );
            })}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ height: "25px" }}>
                <NavButton
                  disabled={dayjs(dates.endDate).year() === maxYear}
                  onClick={() => goForward()}
                  transform={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
