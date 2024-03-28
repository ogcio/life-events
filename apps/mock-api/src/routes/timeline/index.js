import { faker } from "@faker-js/faker";

const drivingEvent1 = (date) => ({
  category: "driving",
  date: new Date(date),
  title: "Driving licence renewal due",
  description: faker.lorem.words(10),
});

const drivingEvent2 = (date) => ({
  category: "driving",
  date: new Date(date),
  title: "Driving licence renewed",
  description: faker.lorem.words(10),
});

const drivingEvent3 = (date) => ({
  category: "driving",
  date: new Date(date),
  title: "VW Golf registered",
  description: faker.lorem.words(10),
});

const housingEvent1 = (date) => ({
  category: "housing",
  date: new Date(date),
  title: "Local Property Tax due",
  description: faker.lorem.words(10),
});

const housingEvent2 = (date) => ({
  category: "housing",
  date: new Date(date),
  title: "Local Property Tax paid",
  description: faker.lorem.words(10),
});

const housingEvent3 = (date) => ({
  category: "housing",
  date: new Date(date),
  title: "Applied for housing benefit",
  description: faker.lorem.words(10),
});

const employmentEvent1 = (date) => ({
  category: "employment",
  date: new Date(date),
  title: "Self-assessment deadline",
  description: faker.lorem.words(10),
  dismissable: true,
});

const healthEvent1 = (date) => ({
  category: "health",
  date: new Date(date),
  title: "Applied for EHIC",
  description: faker.lorem.words(10),
  detailsLink: "/",
});

const timeLineData = [
  {
    year: 2029,
    months: [
      { month: "January", events: [drivingEvent1("2029-01-20")] },
      { month: "September", events: [housingEvent1("2029-09-15")] },
    ],
  },
  {
    year: 2028,
    months: [
      { month: "January", events: [drivingEvent1("2028-01-20")] },
      { month: "September", events: [housingEvent1("2028-09-15")] },
    ],
  },
  {
    year: 2027,
    months: [
      { month: "January", events: [drivingEvent1("2027-01-20")] },
      { month: "September", events: [housingEvent1("2027-09-16")] },
    ],
  },
  {
    year: 2026,
    months: [{ month: "September", events: [housingEvent1("2026-09-15")] }],
  },
  {
    year: 2025,
    months: [
      { month: "January", events: [drivingEvent1("2025-01-20")] },
      { month: "October", events: [employmentEvent1("2025-10-31")] },
    ],
  },
  {
    year: 2024,
    months: [
      {
        month: "February",
        events: [drivingEvent2("2024-02-03"), housingEvent3("2024-02-23")],
      },
      {
        month: "March",
        events: [drivingEvent3("2024-03-02")],
      },
      { month: "September", events: [housingEvent1("2024-09-15")] },
    ],
  },
  {
    year: 2023,
    months: [
      { month: "January", events: [] },
      { month: "June", events: [drivingEvent3("2023-06-07")] },
      { month: "September", events: [] },
      { month: "October", events: [healthEvent1("2023-10-06")] },
    ],
  },
  {
    year: 2022,
    months: [
      { month: "January", events: [drivingEvent2("2022-01/06")] },
      { month: "June", events: [housingEvent2("2022-06-08")] },
      { month: "September", events: [] },
      { month: "October", events: [] },
    ],
  },
  {
    year: 2021,
    months: [
      { month: "January", events: [drivingEvent2("2021-01-07")] },
      { month: "June", events: [housingEvent2("2021-06-10")] },
      { month: "September", events: [] },
      { month: "October", events: [] },
    ],
  },
];

function filterEventsByDateRange(events, startDate, endDate) {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate >= startDate && eventDate <= endDate;
  });
}

function filterEventsByAdditionalParams(events, category, searchQuery) {
  if (searchQuery.length > 0) {
    const lowerCaseSearchQuery = searchQuery.toLowerCase();
    return events.filter((event) =>
      event.title.toLowerCase().includes(lowerCaseSearchQuery),
    );
  }
  return events.filter((event) => filterByCategory(event, category));
}

function filterByCategory(event, category) {
  if (!category || category === "all") {
    return true;
  }
  return event.category === category;
}

function filterTimeline(
  timeLineData,
  startDate,
  endDate,
  category,
  searchQuery,
) {
  const filteredData = [];
  timeLineData.forEach((year) => {
    const filteredMonths = year.months
      .map((month) => ({
        month: month.month,
        events: filterEventsByDateRange(month.events, startDate, endDate),
      }))
      .filter((month) => month.events.length > 0);

    if (filteredMonths.length > 0) {
      filteredData.push({
        year: year.year,
        months: filteredMonths.map(({ month, events }) => ({
          month,
          events: filterEventsByAdditionalParams(events, category, searchQuery),
        })),
      });
    }
  });

  return filteredData;
}

export default async function (app) {
  app.get("/", async (req, reply) => {
    const { startDate, endDate, category, searchQuery } = req.query;
    const filteredTimeLineData = filterTimeline(
      timeLineData,
      new Date(startDate),
      new Date(endDate),
      category,
      searchQuery,
    );

    return new Promise((resolve, _reject) => {
      resolve(filteredTimeLineData);
    });
  });
}
