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

export const JourneyPublicDetails = Type.Object({
  id: Type.String(),
  title: Type.String(),
  userId: Type.String(),
  organizationId: Type.String(),
  status: JourneyStatus,
});

export const StepType = Type.Union([
  Type.Literal("form"),
  Type.Literal("payment"),
  Type.Literal("messaging"),
]);
export type StepType = Static<typeof StepType>;

export const FormStepData = Type.Object({
  url: Type.String(),
  title: Type.String(),
});
export type FormStepData = Static<typeof FormStepData>;

export const PaymentStepData = Type.Object({
  url: Type.String(),
  title: Type.String(),
});
export type PaymentStepData = Static<typeof PaymentStepData>;

export const MessagingStepData = Type.Object({});
export type MessagingStepData = Static<typeof MessagingStepData>;

export const StepData = Type.Union([
  FormStepData,
  PaymentStepData,
  MessagingStepData,
]);
export type StepData = Static<typeof StepData>;

export const JourneyStep = Type.Object({
  id: Type.String(),
  journeyId: Type.String(),
  stepType: StepType,
  stepData: StepData,
  createdAt: Type.String(),
  updatedAt: Type.String(),
});
export type JourneyStep = Static<typeof JourneyStep>;

export const JourneyStepConnection = Type.Object({
  id: Type.String(),
  sourceStepId: Type.String(),
  destinationStepId: Type.String(),
});
export type JourneyStepConnection = Static<typeof JourneyStepConnection>;

export const JourneyDetails = Type.Composite([
  JourneyPublicDetails,
  Type.Object({
    createdAt: Type.String(),
    updatedAt: Type.String(),
    initialStepId: Type.String(),
  }),
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
export type CreateJourneyBodyDO = Static<typeof CreateJourneyBody>;

export const UpdateJourneyBody = Type.Pick(FullJourney, [
  "status",
  "initialStepId",
]);
export type UpdateJourneyBodyDO = Static<typeof UpdateJourneyBody>;
