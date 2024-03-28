"use client";
import Link from "next/link";
import { formatDate } from "../../../utils/web";
import ds from "design-system";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { debounce } from "lodash";
import { TimeLineData } from "../../timeline/TimeLineGrid";

const Icon = ds.Icon;

const minYear = 2021;
const maxYear = 2029;

export default () => {
  const [dates, setDates] = useState({
    startDate: dayjs().format("YYYY"),
    endDate: dayjs().add(5, "year").format("YYYY"),
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
  }, [category, searchQuery]);

  const handleCategoryChange = (selectedCategory: string) => {
    if (dates.startDate !== minYear.toString()) {
      setDates({ startDate: minYear.toString(), endDate: maxYear.toString() });
    }
    setCategory(selectedCategory);
  };

  const handleSearchChangeDebounced = debounce((value) => {
    if (dates.startDate !== minYear.toString()) {
      setDates({ startDate: minYear.toString(), endDate: maxYear.toString() });
    }
    setSearchQuery(value);
  }, 300);

  const handleSearchChange = (value) => {
    handleSearchChangeDebounced(value);
  };

  return (
    <div style={{ height: "100" }}>
      <div>
        <p className="govie-heading-m">Timeline</p>
        <button className="govie-button" style={{ width: "100%" }}>
          + Add an Event
        </button>
      </div>
      <form>
        <div className="govie-form-group">
          <select
            className="govie-select"
            id="default-select"
            name="default-select"
            style={{ minWidth: "initial", width: "100%" }}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="all">All services</option>
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
      <div
        style={{
          height: "400px",
          maxHeight: "400px",
          overflowY: "scroll",
          padding: "0 5px",
          marginBottom: "30px",
        }}
      >
        <div style={{ borderLeft: "1px solid #B1B4B6", paddingLeft: "10px" }}>
          {timeLineData &&
            timeLineData.reverse().map((yearObject) => {
              return yearObject.months.map((monthObject) => {
                const { events } = monthObject;
                return events.map((event) => {
                  return (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "20px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: "-15px",
                          width: "10px",
                          height: "10px",
                          background: "#B1B4B6",
                          content: "''",
                          borderRadius: "50%",
                        }}
                      ></div>
                      <Icon
                        icon={event.service}
                        className="govie-button__icon-left"
                        color={ds.colours.ogcio.darkGreen}
                      />
                      <div>
                        <p className="govie-body" style={{ marginBottom: 0 }}>
                          <strong>{formatDate(event.date)}</strong>
                        </p>
                        <p className="govie-body" style={{ margin: 0 }}>
                          {event.title}
                        </p>
                      </div>
                    </div>
                  );
                });
              });
            })}
        </div>
      </div>
      <Link
        href={`/timeline`}
        className="govie-button"
        style={{ width: "100%", lineHeight: "normal" }}
      >
        See all events
      </Link>
    </div>
  );
};
