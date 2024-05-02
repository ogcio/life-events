import { Static, Type } from "@sinclair/typebox";

export const GetTimelineData = Type.Object({
  searchQuery: Type.Optional(Type.String()),
  startDate: Type.Optional(Type.String()),
  endDate: Type.Optional(Type.String()),
  services: Type.Optional(Type.String()),
});

export type GetTimelineData = Static<typeof GetTimelineData>;

export const Event = Type.Object({
  service: Type.String(),
  date: Type.String(),
  title: Type.String(),
  description: Type.String(),
  weight: Type.Number(),
});

export type Event = Static<typeof Event>;

export const Month = Type.Object({
  month: Type.String(),
  events: Type.Array(Event),
});

export type Month = Static<typeof Month>;

export const TimelineData = Type.Object({
  minYear: Type.Number(),
  maxYear: Type.Number(),
  data: Type.Array(
    Type.Object({
      year: Type.Number(),
      minYear: Type.Number(),
      maxYear: Type.Number(),
      months: Type.Array(Month),
    }),
  ),
});

export type TimelineData = Static<typeof TimelineData>;
