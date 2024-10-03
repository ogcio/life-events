import { Static } from "@sinclair/typebox";
import {
  JourneyDetails,
  JourneyPublicDetails,
  Journeys,
  JourneyStatus,
} from "../../../routes/schemas";

export type JourneyStatusType = Static<typeof JourneyStatus>;
export type JourneyDetailsDO = Static<typeof JourneyDetails>;
export type JourneyPublicDetailsDO = Static<typeof JourneyPublicDetails>;
export type JourneysDO = Static<typeof Journeys>;
