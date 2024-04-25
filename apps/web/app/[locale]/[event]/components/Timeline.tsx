"use client";
import Link from "next/link";
import { formatDate } from "../../../utils/web";
import ds from "design-system";
import { useEffect, useState } from "react";
import { GroupedEvents, TimeLineData } from "../../timeline/Timeline";
import { useTranslations } from "next-intl";

const Icon = ds.Icon;

const darkGrey = ds.hexToRgba(ds.colours.ogcio.darkGrey, 80);
const midGrey = ds.colours.ogcio.midGrey;

export default ({ locale }: { locale: string }) => {
  const t = useTranslations();
  const [service, setService] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeLineData, setTimeLineData] = useState<TimeLineData>();

  const fetchTimelineData = async () => {
    const queryParams = new URLSearchParams({
      startDate: "2018-01-01",
      endDate: "2025-12-31",
      services: service,
      searchQuery,
    });

    const timelineResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/timeline/?${queryParams}`,
    );

    const responseData = await timelineResponse.json();

    setTimeLineData({ ...responseData, data: responseData.data.reverse() });
  };

  useEffect(() => {
    fetchTimelineData();
  }, []);

  useEffect(() => {
    if (service || !searchQuery.length) {
      fetchTimelineData();
    }
  }, [service, searchQuery]);

  const handleCategoryChange = (selectedService: string) => {
    setService(selectedService);
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

  return (
    <div style={{ height: "100" }}>
      <div>
        <p className="govie-heading-m">{t("title")}</p>
      </div>
      <div className="govie-form-group">
        <select
          className="govie-select"
          id="default-select"
          name="default-select"
          style={{ minWidth: "initial", width: "100%" }}
          onChange={(e) => handleCategoryChange(e.target.value.toLowerCase())}
        >
          <option value="">{t("allServices")}</option>
          <option value="driving">{t("driving")}</option>
          <option value="employment">{t("employment")}</option>
          <option value="housing">{t("housing")}</option>
        </select>
      </div>

      <div className="govie-form-group">
        <div className="govie-input__wrapper">
          <input
            type="text"
            id="default-input"
            name="default-input"
            className="govie-input"
            placeholder={t(`searchEvent`)}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <button
            type="button"
            className="govie-input__suffix"
            style={{ cursor: "pointer" }}
            onClick={() => searchEvent()}
            aria-label={t(`search`)}
          >
            <Icon icon={"search"} color={ds.colours.ogcio.darkGreen} />
          </button>
        </div>
      </div>
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
          {timeLineData?.data &&
            timeLineData.data.map((yearObject) => {
              return yearObject.months.map((monthObject) => {
                const { events } = monthObject;
                const groupedEvents: GroupedEvents = events.reduce(
                  (grouped, event) => {
                    const { service, ...rest } = event;
                    if (!grouped[service]) {
                      grouped[service] = [];
                    }
                    grouped[service].push(rest);
                    return grouped;
                  },
                  {},
                );

                return Object.entries(groupedEvents).map(
                  ([service, events]) => {
                    return (
                      <div
                        style={{
                          display: "flex",
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
                            marginTop: "10px",
                            background: midGrey,
                            content: "''",
                            borderRadius: "50%",
                          }}
                        ></div>
                        <div>
                          <Icon
                            icon={
                              service as
                                | "driving"
                                | "employment"
                                | "health"
                                | "housing"
                            }
                            className="govie-button__icon-left"
                            color={ds.colours.ogcio.darkGreen}
                          />
                          {events.map((event) => (
                            <div>
                              <p
                                className="govie-body"
                                style={{
                                  marginBottom: 0,
                                  fontWeight:
                                    event.weight > 1 ? "bold" : "normal",
                                }}
                              >
                                {event.title}
                              </p>
                              <p
                                className="govie-body"
                                style={{
                                  color: darkGrey,
                                }}
                              >
                                <strong>{formatDate(event.date)}</strong>
                              </p>
                            </div>
                          ))}
                          <Link
                            href={`/${locale}/timeline/details`}
                            className="govie-link govie-body-s"
                          >
                            <span>{t("details")}</span>
                          </Link>
                        </div>
                      </div>
                    );
                  },
                );
              });
            })}
        </div>
      </div>
      <Link
        href={`/${locale}/timeline?grid=true`}
        className="govie-button"
        style={{ width: "100%", lineHeight: "normal" }}
      >
        {t("seeAllEvents")}
      </Link>
    </div>
  );
};
