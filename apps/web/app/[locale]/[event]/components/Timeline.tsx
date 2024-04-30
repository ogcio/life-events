import Link from "next/link";
import { formatDate } from "../../../utils/web";
import ds from "design-system";
import { GroupedEvents } from "../../timeline/Timeline";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import EventTypeSelector from "./EventTypeSelector";
import { headers } from "next/headers";
import SearchForm from "../../timeline/SearchForm";
import { Timeline } from "building-blocks-sdk";

const Icon = ds.Icon;

const darkGrey = ds.hexToRgba(ds.colours.ogcio.darkGrey, 80);
const midGrey = ds.colours.ogcio.midGrey;

type TimelineProps = {
  searchProps?: {
    [key: string]: string;
  };
  locale: string;
  messages: AbstractIntlMessages;
  userId: string;
};

export default async ({
  searchProps,
  messages,
  locale,
  userId,
}: TimelineProps) => {
  const path = headers().get("x-pathname")?.toString();

  const t = await getTranslations("Timeline");

  const queryParams = new URLSearchParams(searchProps);
  if (!queryParams.get("startData")) {
    queryParams.set("startDate", "2018-01-01");
  }

  if (!queryParams.get("endDate")) {
    queryParams.set("endDate", "2025-12-31");
  }

  if (!queryParams.get("services")) {
    queryParams.set("services", ["driving", "employment", "housing"].join(","));
  }

  const searchQuery = queryParams.get("searchQuery") || "";

  queryParams.set("searchQuery", searchQuery);

  const timelineData = await new Timeline(userId).getTimelineData(
    Object.fromEntries(queryParams),
  );

  return (
    <div style={{ height: "100" }}>
      <div>
        <p className="govie-heading-m">{t("title")}</p>
      </div>
      <div className="govie-form-group">
        <NextIntlClientProvider messages={messages}>
          <EventTypeSelector searchProps={searchProps} />
        </NextIntlClientProvider>
      </div>

      <div className="govie-form-group">
        <SearchForm searchParams={new URLSearchParams(queryParams)} />
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
          {timelineData?.data &&
            timelineData.data.data.reverse().map((yearObject) => {
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
        href={`/${locale}/timeline?viewMode=grid`}
        className="govie-button"
        style={{ width: "100%", lineHeight: "normal" }}
      >
        {t("seeAllEvents")}
      </Link>
    </div>
  );
};
