"use client";
import { useEffect, useState } from "react";
import Menu from "./Menu";
import Link from "next/link";
import TimeLineGrid from "./TimeLineGrid";
import { NextPageProps } from "../../utils/web";
import TimeLineList from "./TimeLineList";

type Event = {
  service: string;
  date: Date;
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

export default ({
  userName,
  searchParams,
}: {
  userName: string;
  searchParams: NextPageProps["searchParams"];
}) => {
  const [services, setServices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeLineData, setTimeLineData] = useState<TimeLineData>();

  const fetchTimelineData = async () => {
    const queryParams = new URLSearchParams({
      startDate: "2018-01-01",
      endDate: "2025-12-31",
      services: services.join(","),
      searchQuery,
    });

    const timelineResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/timeline/?${queryParams}`,
    );

    const responseData = await timelineResponse.json();

    setTimeLineData(responseData);
  };

  useEffect(() => {
    fetchTimelineData();
  }, []);

  useEffect(() => {
    if (services.length || !searchQuery.length) {
      fetchTimelineData();
    }
  }, [services.length, searchQuery]);

  const handleServiceChange = (selectedService: string) => {
    setServices((prevServices) => {
      if (prevServices.includes(selectedService)) {
        return prevServices.filter((item) => item !== selectedService);
      } else {
        return [...prevServices, selectedService];
      }
    });
  };

  const handleSearchChange = (value) => {
    if (value.length) {
      setSearchQuery(value);
    } else {
      setSearchQuery("");
    }
  };

  const searchEvent = () => {
    fetchTimelineData();
  };

  const showGrid = Boolean(searchParams?.grid) || false;

  return (
    <>
      <div>
        <Menu
          userName={userName}
          handleSearchChange={handleSearchChange}
          handleCategoryChange={handleServiceChange}
          searchEvent={searchEvent}
        />
      </div>
      <div style={{ width: "100%" }}>
        <div style={{ textAlign: "right" }}>
          <p className="govie-body-s">
            View:{" "}
            <Link href="?list=true" className="govie-link">
              List
            </Link>{" "}
            |{" "}
            <Link href="?grid=true" className="govie-link">
              Grid
            </Link>
          </p>
        </div>
        {showGrid ? (
          <TimeLineGrid timeLineData={timeLineData} />
        ) : (
          <TimeLineList timeLineData={timeLineData} />
        )}
      </div>
    </>
  );
};
