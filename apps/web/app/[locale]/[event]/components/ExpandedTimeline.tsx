"use client";
import { useEffect, useState } from "react";
import { formatDate } from "../../../utils/web";
import ds from "design-system";
import { debounce } from "lodash";
import dayjs from "dayjs";

export type TimeLineData = {
  year: number;
  months: {
    month: string;
    events: {
      category: string;
      date: Date;
      title: string;
      description: string;
    }[];
  }[];
};

const tintGold = ds.hexToRgba(ds.colours.ogcio.gold, 15);
const minYear = 2021;
const maxYear = 2029;

export default () => {
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
    setCategory(selectedCategory);
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
    <div>
      <form style={{ display: "flex" }}>
        <div className="govie-form-group" style={{ marginRight: "20px" }}>
          <select
            className="govie-select"
            id="default-select"
            name="default-select"
            style={{ minWidth: "initial" }}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="all">All categories</option>
            <option value="driving">Driving</option>
            <option value="housing">Housing</option>
          </select>
        </div>
        <div className="govie-form-group">
          <input
            type="text"
            id="default-input"
            name="default-input"
            className="govie-input"
            placeholder={"Search event..."}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </form>
      {!timeLineData.length ? (
        <p className="govie-body">Events not found</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "40px 1fr 1fr 1fr 1fr 1fr 1fr 40px",
            columnGap: "20px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ height: "25px" }}>
              <button
                onClick={() => goBack()}
                disabled={dayjs(dates.startDate).year() === minYear}
              >
                {"<"}
              </button>
            </div>
          </div>
          {timeLineData.map((yearData) => {
            return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
                key={yearData.year}
              >
                <div>
                  <p
                    className="govie-body"
                    style={{ textAlign: "center", marginBottom: 0 }}
                  >
                    {yearData.year}
                  </p>
                </div>
                {yearData.months.map((monthObject) => {
                  const { events } = monthObject;
                  return (
                    <>
                      {events.map((event) => {
                        return (
                          <div
                            style={{
                              backgroundColor: tintGold,
                              padding: "12px",
                            }}
                          >
                            <p
                              className="govie-body govie-!-font-size-16"
                              style={{ marginBottom: 0 }}
                            >
                              <strong>{formatDate(event.date)}</strong>
                            </p>
                            <p className="govie-body govie-!-font-size-16">
                              {event.title}
                            </p>
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
              <button
                onClick={() => goForward()}
                disabled={dayjs(dates.endDate).year() === maxYear}
              >
                {">"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
