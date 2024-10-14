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
 * Journeys
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
export type FullJourneyDO = Static<typeof FullJourney>;

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
export type UpdateJourneyBodyDO = Static<typeof UpdateJourneyBody>;

/**
 * Run Steps
 */
export const StepStatus = Type.Union([
  Type.Literal("pending"),
  Type.Literal("in_progress"),
  Type.Literal("failed"),
  Type.Literal("completed"),
]);

export const RunStep = Type.Object({
  id: Type.String(),
  runId: Type.String(),
  stepId: Type.String(),
  status: StepStatus,
  data: Type.Any(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
});

/**
 * Runs
 */
export const RunStatus = Type.Union([
  Type.Literal("pending"),
  Type.Literal("failed"),
  Type.Literal("completed"),
]);

export const UserFullRun = Type.Object({
  id: Type.String(),
  userId: Type.String(),
  journeyId: Type.String(),
  status: RunStatus,
  createdAt: Type.String(),
  updatedAt: Type.String(),
  steps: Type.Array(RunStep),
});
export type UserFullRunDO = Static<typeof UserFullRun>;

export const PublicServantFullRun = Type.Composite([
  UserFullRun,
  Type.Object({
    organizationId: Type.String(),
  }),
]);
export type PublicServantFullRunDO = Static<typeof PublicServantFullRun>;

export const UserRunDetails = Type.Pick(UserFullRun, [
  "id",
  "userId",
  "journeyId",
  "status",
  "createdAt",
  "updatedAt",
]);

export const UserRuns = Type.Array(UserRunDetails);

export const PublicServantRunDetails = Type.Composite([
  UserRunDetails,
  Type.Object({
    organizationId: Type.String(),
  }),
]);

export const PublicServantRuns = Type.Array(UserRunDetails);

export const ParamsWithRunId = Type.Object({
  runId: Type.String(),
});
export type ParamsWithRunIdDO = Static<typeof ParamsWithRunId>;
