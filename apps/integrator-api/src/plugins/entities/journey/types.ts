import { Static } from "@sinclair/typebox";
import {
  CreateJourneyBody,
  FullJourney,
  JourneyDetails,
  JourneyPublicDetails,
  Journeys,
  JourneyStatus,
  ParamsWithJourneyId,
  UpdateJourneyBody,
} from "../../../routes/schemas";

export type JourneyStatusType = Static<typeof JourneyStatus>;
export type JourneyDetailsDO = Static<typeof JourneyDetails>;
export type JourneyPublicDetailsDO = Static<typeof JourneyPublicDetails>;
export type JourneysDO = Static<typeof Journeys>;

export type FullJourneyDO = Static<typeof FullJourney>;
export type CreateJourneyBodyDO = Static<typeof CreateJourneyBody>;
export type UpdateJourneyBodyDO = Static<typeof UpdateJourneyBody>;

export enum JourneyStatusEnum {
  ACTIVE = "active",
  DRAFT = "draft",
}

export type ParamsWithJourneyId = Static<typeof ParamsWithJourneyId>;
