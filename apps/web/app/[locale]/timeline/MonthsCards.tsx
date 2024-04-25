import Link from "next/link";
import { formatDate } from "../../utils/web";
import { GroupedEvents, Month } from "./Timeline";
import ds from "design-system";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";

const Icon = ds.Icon;

const tintGold = ds.hexToRgba(ds.colours.ogcio.gold, 15);
const opaque = ds.hexToRgba(ds.colours.ogcio.gold, 5);
const darkGrey = ds.hexToRgba(ds.colours.ogcio.darkGrey, 80);

export default ({
  months,
  view,
  locale,
}: {
  months: Month[];
  view: string;
  locale: string;
}) => {
  const t = useTranslations();
  return months.map((monthObject) => {
    const { events } = monthObject;
    const groupedEvents: GroupedEvents = events.reduce((grouped, event) => {
      const { service, ...rest } = event;
      if (!grouped[service]) {
        grouped[service] = [];
      }
      grouped[service].push(rest);
      return grouped;
    }, {});

    return (
      <>
        {Object.entries(groupedEvents).map(([service, events]) => {
          return (
            <div
              style={{
                backgroundColor: dayjs(events[0].date).isBefore(dayjs())
                  ? opaque
                  : tintGold,
                padding: "12px",
                marginBottom: "16px",
              }}
            >
              <Icon
                icon={
                  service as "driving" | "employment" | "health" | "housing"
                }
                className="govie-button__icon-left"
                color={ds.colours.ogcio.darkGreen}
              />
              <ul className="govie-list">
                {events.map((event) => (
                  <li>
                    <p
                      className="govie-body govie-!-font-size-16"
                      style={{
                        fontWeight: event.weight > 1 ? "bold" : "normal",
                        marginBottom: 0,
                      }}
                    >
                      {event.title}
                    </p>
                    <p
                      className="govie-body govie-!-font-size-16"
                      style={{ color: darkGrey }}
                    >
                      {formatDate(event.date)}
                    </p>
                  </li>
                ))}
              </ul>
              <div style={{ textAlign: "right" }}>
                <Link
                  href={{
                    pathname: `/${locale}/timeline/details`,
                    query: { view },
                  }}
                  className="govie-body-s govie-link"
                >
                  <span>{t("details")}</span>
                </Link>
              </div>
            </div>
          );
        })}
      </>
    );
  });
};
