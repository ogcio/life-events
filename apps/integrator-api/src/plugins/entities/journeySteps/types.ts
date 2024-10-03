import { Static } from "@sinclair/typebox";
import {
  CreateJourneyStep,
  JourneyStep,
  JourneyStepTypes,
  ParamsWithJourneyStepId,
  UpdateJourneyStep,
} from "../../../routes/schemas";

export type JourneyStepTypesDO = Static<typeof JourneyStepTypes>;
export type JourneyStepDO = Static<typeof JourneyStep>;
export type CreateJourneyStepDO = Static<typeof CreateJourneyStep>;
export type UpdateJourneyStepDO = Static<typeof UpdateJourneyStep>;
export type ParamsWithJourneyStepIdDO = Static<typeof ParamsWithJourneyStepId>;
