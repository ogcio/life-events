import { Static } from "@sinclair/typebox";
import {
  UserRunDetails,
  RunStep,
  PublicServantRunDetails,
} from "../../../routes/schemas";

export type UserRunDetailsDO = Static<typeof UserRunDetails>;
export type PSRunDetailsDO = Static<typeof PublicServantRunDetails>;

export type RunStepDO = Static<typeof RunStep>;

export enum RunStatusEnum {
  PENDING = "pending",
  FAILED = "failed",
  COMPLETED = "completed",
}

export enum RunStepStatusEnum {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  FAILED = "failed",
  COMPLETED = "completed",
}
