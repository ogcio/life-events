import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors.js";
import {
  Event,
  GetTimelineData,
  TimelineData,
} from "../../types/schemaDefinitions.js";

const drivingEvent1 = (date: string | number | Date) => ({
  service: "driving",
  date: new Date(date).toString(),
  title: "Driving licence renewal due",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi convallis.",
  weight: 1,
});

const drivingEvent2 = (date: string | number | Date) => ({
  service: "driving",
  date: new Date(date).toString(),
  title: "Driving licence renewed",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi convallis.",
  weight: 3,
});

const drivingEvent3 = (date: string | number | Date) => ({
  service: "driving",
  date: new Date(date).toString(),
  title: "VW Golf registered",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi convallis.",
  weight: 2,
});

const drivingEvent4 = (date: string | number | Date) => ({
  service: "driving",
  date: new Date(date).toString(),
  title: "VW Golf purchased",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi convallis.",
  weight: 3,
});

const drivingEvent5 = (date: string | number | Date) => ({
  service: "driving",
  date: new Date(date).toString(),
  title: "VW Golf MOT issued",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi convallis.",
  weight: 2,
});

const drivingEvent6 = (date: string | number | Date) => ({
  service: "driving",
  date: new Date(date).toString(),
  title: "VW Golf MOT due",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi convallis.",
  weight: 1,
});

const drivingEvent7 = (date: string | number | Date) => ({
  service: "driving",
  date: new Date(date).toString(),
  title: "Applied for new driving licence",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi convallis.",
  weight: 1,
});

const drivingEvent8 = (date: string | number | Date) => ({
  service: "driving",
  date: new Date(date).toString(),
  title: "Paid for new driving licence",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi convallis.",
  weight: 1,
});

const drivingEvent9 = (date: string | number | Date) => ({
  service: "driving",
  date: new Date(date).toString(),
  title: "Driving licence issued",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi convallis.",
  weight: 2,
});

const drivingEvent10 = (date: string | number | Date) => ({
  service: "driving",
  date: new Date(date).toString(),
  title: "Driving licence added to digital wallet",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi convallis.",
  weight: 2,
});

const housingEvent1 = (date: string | number | Date) => ({
  service: "housing",
  date: new Date(date).toString(),
  title: "Local Property Tax due",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi convallis.",
  weight: 1,
});

const housingEvent2 = (date: string | number | Date) => ({
  service: "housing",
  date: new Date(date).toString(),
  title: "Local Property Tax paid",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi convallis.",
  weight: 1,
});

const housingEvent3 = (date: string | number | Date) => ({
  service: "housing",
  date: new Date(date).toString(),
  title: "Applied for housing benefit",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi convallis.",
  weight: 1,
});

const housingEvent4 = (date: string | number | Date) => ({
  service: "housing",
  date: new Date(date).toString(),
  title: "Purchased a house",
  description: "10 Belfort Court, Sydenham Villas, Dundrum, Dublin 14, Ireland",
  weight: 3,
});

const housingEvent5 = (date: string | number | Date) => ({
  service: "housing",
  date: new Date(date).toString(),
  title: "Stamp Duty Land Tax paid",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi convallis.",
  weight: 1,
});

const housingEvent6 = (date: string | number | Date) => ({
  service: "housing",
  date: new Date(date).toString(),
  title: "Applied for planning permission",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi convallis.",
  weight: 1,
});

const housingEvent7 = (date: string | number | Date) => ({
  service: "housing",
  date: new Date(date).toString(),
  title: "Planning permission granted",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi convallis.",
  weight: 2,
});

const employmentEvent1 = (date: string | number | Date) => ({
  service: "employment",
  date: new Date(date).toString(),
  title: "Self-assessment deadline",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi convallis.",
  weight: 2,
});

const employmentEvent2 = (date: string | number | Date) => ({
  service: "employment",
  date: new Date(date).toString(),
  title: "Jobseeker's Allowance requested",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi convallis.",
  weight: 1,
});

const employmentEvent3 = (date: string | number | Date) => ({
  service: "employment",
  date: new Date(date).toString(),
  title: "Jobseeker's Allowance approved",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi convallis.",
  weight: 3,
});

const employmentEvent4 = (date: string | number | Date, company: string) => ({
  service: "employment",
  date: new Date(date).toString(),
  title: `Employment started with ${company} `,
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi convallis.",
  weight: 3,
});

const employmentEvent5 = (date: string | number | Date) => ({
  service: "employment",
  date: new Date(date).toString(),
  title: "Jobseeker's Allowance stopped",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi convallis.",
  weight: 3,
});

const healthEvent1 = (date: string | number | Date) => ({
  service: "health",
  date: new Date(date).toString(),
  title: "Applied for EHIC",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi convallis.",
  weight: 1,
});

/**
 * this is a dummy data, it will be removed as we migrate to real data
 */
type TimelineDataYear = {
  year: number;
  months: {
    month: string;
    events: {
      service: string;
      date: string;
      title: string;
      description: string;
      weight: number;
    }[];
  }[];
}[];

const timeLineData: TimelineDataYear = [
  {
    year: 2018,
    months: [
      { month: "July", events: [drivingEvent3("2018-07-07")] },
      {
        month: "September",
        events: [
          employmentEvent2("2018-09-10"),
          employmentEvent3("2018-09-24"),
        ],
      },
    ],
  },
  {
    year: 2019,
    months: [
      {
        month: "February",
        events: [
          employmentEvent4("2019-02-02", "Lisney Estate Agents"),
          employmentEvent5("2019-02-02"),
        ],
      },
    ],
  },
  {
    year: 2020,
    months: [{ month: "June", events: [housingEvent3("2020-06-30")] }],
  },
  {
    year: 2021,
    months: [{ month: "June", events: [drivingEvent5("2021-06-30")] }],
  },
  {
    year: 2022,
    months: [
      { month: "June", events: [drivingEvent5("2022-06-20")] },
      {
        month: "November",
        events: [
          housingEvent4("2022-11-10"),
          housingEvent5("2022-11-10"),
          housingEvent2("2022-11-10"),
          drivingEvent7("2022-11-13"),
          drivingEvent8("2022-11-13"),
          drivingEvent9("2022-11-15"),
          drivingEvent10("2022-11-15"),
          employmentEvent4("2022-11-17", "Charles McCarthy Estate Agents"),
        ],
      },
    ],
  },
  {
    year: 2023,
    months: [
      {
        month: "July",
        events: [
          housingEvent6("2023-07-01"),
          housingEvent7("2023-07-04"),
          drivingEvent5("2023-07-02"),
        ],
      },
      { month: "November", events: [housingEvent2("2023-10-17")] },
    ],
  },
  {
    year: 2024,
    months: [
      { month: "July", events: [drivingEvent6("2024-07-07")] },
      { month: "December", events: [housingEvent1("2024-12-01")] },
    ],
  },
  {
    year: 2025,
    months: [{ month: "October", events: [employmentEvent1("2025-10-28")] }],
  },
];

function filterEventsByDateRange(
  events: Event[],
  startDate: Date,
  endDate: Date,
) {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate >= startDate && eventDate <= endDate;
  });
}

function filterEventsByAdditionalParams(
  events: Event[],
  services: string,
  searchQuery: string,
) {
  if (searchQuery.length > 0) {
    const lowerCaseSearchQuery = searchQuery.toLowerCase();
    return events.filter((event: { title: string }) =>
      event.title.toLowerCase().includes(lowerCaseSearchQuery),
    );
  }
  return events.filter((event) => filterByService(event, services));
}

function filterByService(event: Event, services: string) {
  if (!services || !services.length) {
    return true;
  }
  return services.split(",").includes(event.service);
}

function sortByDateAndWeight(events: Event[]) {
  return events.sort((event1, event2) => {
    if (event2.weight !== event1.weight) {
      return event2.weight - event1.weight;
    } else {
      return new Date(event2.date).getTime() - new Date(event1.date).getTime();
    }
  });
}

function filterTimeline(
  timeLineData: TimelineDataYear,
  startDate: Date,
  endDate: Date,
  services: string,
  searchQuery: string,
): TimelineData {
  const filteredData: TimelineData = {
    minYear: Infinity,
    maxYear: 0,
    data: [],
  };

  timeLineData.forEach((year) => {
    const filteredMonths = year.months
      .map((month) => {
        const eventsFiltered = filterEventsByAdditionalParams(
          month.events,
          services,
          searchQuery,
        );

        // Update minYear and maxYear based on events years
        eventsFiltered.forEach((event: { date: string | number | Date }) => {
          const eventYear = new Date(event.date).getFullYear();
          if (eventYear < filteredData.minYear)
            filteredData.minYear = eventYear;
          if (eventYear > filteredData.maxYear)
            filteredData.maxYear = eventYear;
        });

        const eventsInRange = filterEventsByDateRange(
          eventsFiltered,
          startDate,
          endDate,
        );

        const eventsSorted = sortByDateAndWeight(eventsInRange);

        return {
          month: month.month,
          events: eventsSorted,
        };
      })
      .filter(({ events }) => events.length > 0);

    if (filteredMonths.length > 0) {
      filteredData.data.push({
        year: year.year,
        minYear: Infinity,
        maxYear: 0,
        months: filteredMonths,
      });
    }
  });
  return filteredData;
}

export default async function timeline(app: FastifyInstance) {
  app.get<{ Querystring: GetTimelineData; Reply: TimelineData }>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["TimelineData"],
        querystring: GetTimelineData,
        response: {
          200: TimelineData,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      //   const userId = request.user?.id;

      try {
        let { endDate, searchQuery, services, startDate } = request.query;

        if (!endDate) {
          endDate = new Date().toString();
        }

        if (!startDate) {
          startDate = "2018-01-01";
        }

        if (!services) {
          services = "driving,housing,employment";
        }

        if (!searchQuery) {
          searchQuery = "";
        }

        const filteredTimeLineData = filterTimeline(
          timeLineData,
          new Date(startDate),
          new Date(endDate),
          services,
          searchQuery,
        );

        reply.send(filteredTimeLineData);
      } catch (error) {
        throw app.httpErrors.internalServerError((error as Error).message);
      }
    },
  );
}
