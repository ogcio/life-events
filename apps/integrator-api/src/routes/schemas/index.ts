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

export const EmptyBody = Type.Optional(Type.Object({}));

/**
 * Journey Step Connections
 */
export const JourneyStepConnection = Type.Object({
  id: Type.String(),
  sourceStepId: Type.String(),
  destinationStepId: Type.String(),
});

export const CreateJourneyStepConnection = Type.Composite([
  Type.Pick(JourneyStepConnection, ["sourceStepId", "destinationStepId"]),
  Type.Object({
    journeyId: Type.String(),
  }),
]);

export const ParamsWithJourneyStepConnectionId = Type.Object({
  connectionId: Type.String(),
});
export type ParamsWithJourneyStepConnectionIdDO = Static<
  typeof ParamsWithJourneyStepConnectionId
>;

/**
 * Journey Steps
 */
export const JourneyStepTypes = Type.Union([
  Type.Literal("form"),
  Type.Literal("payment"),
  Type.Literal("messaging"),
]);

export const FormStepData = Type.Object({
  url: Type.String(),
  title: Type.String(),
});

export const PaymentStepData = Type.Object({
  url: Type.String(),
  title: Type.String(),
});

export const MessagingStepData = Type.Object({});

export const StepData = Type.Union([
  FormStepData,
  PaymentStepData,
  MessagingStepData,
]);

export const JourneyStep = Type.Object({
  id: Type.String(),
  journeyId: Type.String(),
  stepType: JourneyStepTypes,
  stepData: StepData,
  createdAt: Type.String(),
  updatedAt: Type.String(),
});

export const CreateJourneyStep = Type.Pick(JourneyStep, [
  "journeyId",
  "stepType",
  "stepData",
]);

export const UpdateJourneyStep = Type.Pick(JourneyStep, [
  "stepType",
  "stepData",
]);

export const ParamsWithJourneyStepId = Type.Object({
  stepId: Type.String(),
});
export type ParamsWithJourneyStepIdDO = Static<typeof ParamsWithJourneyStepId>;

/**
 * Journey
 */
export const ParamsWithJourneyId = Type.Object({
  journeyId: Type.String(),
});
export type ParamsWithJourneyId = Static<typeof ParamsWithJourneyId>;

export const JourneyStatus = Type.Union([
  Type.Literal("active"),
  Type.Literal("draft"),
]);

export const JourneyDetails = Type.Object({
  id: Type.String(),
  title: Type.String(),
  userId: Type.String(),
  organizationId: Type.String(),
  status: JourneyStatus,
  createdAt: Type.String(),
  updatedAt: Type.String(),
  initialStepId: Type.String(),
});

export const JourneyPublicDetails = Type.Pick(JourneyDetails, [
  "id",
  "title",
  "userId",
  "organizationId",
  "status",
]);

export const FullJourney = Type.Composite([
  JourneyDetails,
  Type.Object({
    steps: Type.Array(JourneyStep),
    connections: Type.Array(JourneyStepConnection),
  }),
]);

export const Journeys = Type.Array(JourneyPublicDetails);

export const CreateJourneyBody = Type.Object({
  title: Type.String(),
  organizationId: Type.String(),
  userId: Type.String(),
});

export const UpdateJourneyBody = Type.Pick(FullJourney, [
  "status",
  "initialStepId",
]);
