import { Static } from "@sinclair/typebox";
import { RunDetails, RunStep } from "../../../routes/schemas";

export type RunDetailsDO = Static<typeof RunDetails>;

export type RunStepDO = Static<typeof RunStep>;

export enum RunStatusEnum {
  PENDING = "pending",
  FAILED = "failed",
  COMPLETED = "completed",
}
