import { faker } from "@faker-js/faker";

const drivingEvent1 = (date) => ({
  service: "driving",
  date: new Date(date),
  title: "Driving licence renewal due",
  description: faker.lorem.words(10),
  weight: 1,
});

const drivingEvent2 = (date) => ({
  service: "driving",
  date: new Date(date),
  title: "Driving licence renewed",
  description: faker.lorem.words(10),
  weight: 3,
});

const drivingEvent3 = (date) => ({
  service: "driving",
  date: new Date(date),
  title: "VW Golf registered",
  description: faker.lorem.words(10),
  weight: 2,
});

const drivingEvent4 = (date) => ({
  service: "driving",
  date: new Date(date),
  title: "VW Golf purchased",
  description: faker.lorem.words(10),
  weight: 3,
});

const drivingEvent5 = (date) => ({
  service: "driving",
  date: new Date(date),
  title: "VW Golf MOT issued",
  description: faker.lorem.words(10),
  weight: 2,
});

const drivingEvent6 = (date) => ({
  service: "driving",
  date: new Date(date),
  title: "VW Golf MOT due",
  description: faker.lorem.words(10),
  weight: 1,
});

const drivingEvent7 = (date) => ({
  service: "driving",
  date: new Date(date),
  title: "Applied for new driving licence",
  description: faker.lorem.words(10),
  weight: 1,
});

const drivingEvent8 = (date) => ({
  service: "driving",
  date: new Date(date),
  title: "Paid for new driving licence",
  description: faker.lorem.words(10),
  weight: 1,
});

const drivingEvent9 = (date) => ({
  service: "driving",
  date: new Date(date),
  title: "Driving licence issued",
  description: faker.lorem.words(10),
  weight: 2,
});

const drivingEvent10 = (date) => ({
  service: "driving",
  date: new Date(date),
  title: "Driving licence added to digital wallet",
  description: faker.lorem.words(10),
  weight: 2,
});

const housingEvent1 = (date) => ({
  service: "housing",
  date: new Date(date),
  title: "Local Property Tax due",
  description: faker.lorem.words(10),
  weight: 1,
});

const housingEvent2 = (date) => ({
  service: "housing",
  date: new Date(date),
  title: "Local Property Tax paid",
  description: faker.lorem.words(10),
  weight: 1,
});

const housingEvent3 = (date) => ({
  service: "housing",
  date: new Date(date),
  title: "Applied for housing benefit",
  description: faker.lorem.words(10),
  weight: 1,
});

const housingEvent4 = (date) => ({
  service: "housing",
  date: new Date(date),
  title: "Purchased a house",
  description: "10 Belfort Court, Sydenham Villas, Dundrum, Dublin 14, Ireland",
  weight: 3,
});

const housingEvent5 = (date) => ({
  service: "housing",
  date: new Date(date),
  title: "Stamp Duty Land Tax paid",
  description: faker.lorem.words(10),
  weight: 1,
});

const housingEvent6 = (date) => ({
  service: "housing",
  date: new Date(date),
  title: "Applied for planning permission",
  description: faker.lorem.words(10),
  weight: 1,
});

const housingEvent7 = (date) => ({
  service: "housing",
  date: new Date(date),
  title: "Planning permission granted",
  description: faker.lorem.words(10),
  weight: 2,
});

const employmentEvent1 = (date) => ({
  service: "employment",
  date: new Date(date),
  title: "Self-assessment deadline",
  description: faker.lorem.words(10),
  weight: 2,
});

const employmentEvent2 = (date) => ({
  service: "employment",
  date: new Date(date),
  title: "Jobseeker's Allowance requested",
  description: faker.lorem.words(10),
  weight: 1,
});

const employmentEvent3 = (date) => ({
  service: "employment",
  date: new Date(date),
  title: "Jobseeker's Allowance approved",
  description: faker.lorem.words(10),
  weight: 3,
});

const employmentEvent4 = (date, company) => ({
  service: "employment",
  date: new Date(date),
  title: `Employment started with ${company} `,
  description: faker.lorem.words(10),
  weight: 3,
});

const employmentEvent5 = (date) => ({
  service: "employment",
  date: new Date(date),
  title: "Jobseeker's Allowance stopped",
  description: faker.lorem.words(10),
  weight: 3,
});

const healthEvent1 = (date) => ({
  service: "health",
  date: new Date(date),
  title: "Applied for EHIC",
  description: faker.lorem.words(10),
  weight: 1,
});

const timeLineData = [
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

function filterEventsByDateRange(events, startDate, endDate) {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate >= startDate && eventDate <= endDate;
  });
}

function filterEventsByAdditionalParams(events, services, searchQuery) {
  if (searchQuery.length > 0) {
    const lowerCaseSearchQuery = searchQuery.toLowerCase();
    return events.filter((event) =>
      event.title.toLowerCase().includes(lowerCaseSearchQuery),
    );
  }
  return events.filter((event) => filterByService(event, services));
}

function filterByService(event, services) {
  if (!services || !services.length) {
    return true;
  }
  return services.split(",").includes(event.service);
}

function sortByDateAndWeight(events) {
  return events.sort((event1, event2) => {
    if (event2.weight !== event1.weight) {
      return event2.weight - event1.weight;
    } else {
      return new Date(event2.date) - new Date(event1.date);
    }
  });
}

function filterTimeline(
  timeLineData,
  startDate,
  endDate,
  services,
  searchQuery,
) {
  const filteredData = {
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
        eventsFiltered.forEach((event) => {
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
        months: filteredMonths,
      });
    }
  });
  return filteredData;
}

export default async function (app) {
  app.get("/", async (req, reply) => {
    const { startDate, endDate, services, searchQuery } = req.query;
    const filteredTimeLineData = filterTimeline(
      timeLineData,
      new Date(startDate),
      new Date(endDate),
      services,
      searchQuery,
    );

    return new Promise((resolve, _reject) => {
      resolve(filteredTimeLineData);
    });
  });
}
