import { Static } from "@sinclair/typebox";
import {
  CreateJourneyBody,
  JourneyDetails,
  JourneyPublicDetails,
  JourneyStatus,
} from "../../../routes/schemas";

export type JourneyStatusType = Static<typeof JourneyStatus>;
export type JourneyDetailsDO = Static<typeof JourneyDetails>;
export type JourneyPublicDetailsDO = Static<typeof JourneyPublicDetails>;

export type CreateJourneyBodyDO = Static<typeof CreateJourneyBody>;

export enum JourneyStatusEnum {
  ACTIVE = "active",
  DRAFT = "draft",
}
