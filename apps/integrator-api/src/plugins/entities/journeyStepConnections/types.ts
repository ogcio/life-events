import { Static } from "@sinclair/typebox";
import {
  CreateJourneyStepConnection,
  JourneyStepConnection,
  ParamsWithJourneyStepConnectionId,
} from "../../../routes/schemas";

export type JourneyStepConnectionDO = Static<typeof JourneyStepConnection>;
export type CreateJourneyStepConnectionDO = Static<
  typeof CreateJourneyStepConnection
>;
export type ParamsWithJourneyStepConnectionIdDO = Static<
  typeof ParamsWithJourneyStepConnectionId
>;
