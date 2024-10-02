import { Static, TSchema, Type } from "@sinclair/typebox";

export const Id = Type.Object({
  id: Type.String(),
});
export type Id = Static<typeof Id>;

export const PaginationLink = Type.Object({
  href: Type.Optional(Type.String()),
});

export const PaginationLinks = Type.Object({
  self: PaginationLink,
  next: Type.Optional(PaginationLink),
  prev: Type.Optional(PaginationLink),
  first: PaginationLink,
  last: PaginationLink,
  pages: Type.Record(Type.String(), PaginationLink),
});

export type PaginationLinks = Static<typeof PaginationLinks>;

export const GenericResponse = <T extends TSchema>(T: T) =>
  Type.Object({
    data: T,
    metadata: Type.Optional(
      Type.Object({
        links: Type.Optional(PaginationLinks),
        totalCount: Type.Optional(Type.Number()),
      }),
    ),
  });

export type GenericResponse<T> = {
  data: T;
  metadata?: {
    links?: PaginationLinks;
    totalCount?: number;
  };
};

export const ParamsWithJourneyId = Type.Object({
  journeyId: Type.String(),
});

export type ParamsWithJourneyId = Static<typeof ParamsWithJourneyId>;

export const JourneyStatus = Type.Union([
  Type.Literal("active"),
  Type.Literal("draft"),
]);
export type JourneyStatusType = Static<typeof JourneyStatus>;

export const JourneyDetails = Type.Object({
  id: Type.String(),
  title: Type.String(),
  userId: Type.String(),
  organizationId: Type.String(),
  status: JourneyStatus,
  createdAt: Type.String(),
  updatedAt: Type.String(),
});

export type JourneyDetailsDO = Static<typeof JourneyDetails>;

export const Journeys = Type.Array(JourneyDetails);
export type Journeys = Static<typeof Journeys>;

export const CreateJourneyBody = Type.Object({
  title: Type.String(),
  organizationId: Type.String(),
  userId: Type.String(),
});

export type CreateJourneyBodyDO = Static<typeof CreateJourneyBody>;

export const UpdateJourneyBody = Type.Pick(JourneyDetails, ["status"]);
export type UpdateJourneyBodyDO = Static<typeof UpdateJourneyBody>;
