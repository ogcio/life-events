import { Static } from "@sinclair/typebox";
import {
  CreateJourneyStepConnection,
  JourneyStepConnection,
} from "../../../routes/schemas";

export type JourneyStepConnectionDO = Static<typeof JourneyStepConnection>;
export type CreateJourneyStepConnectionDO = Static<
  typeof CreateJourneyStepConnection
>;
