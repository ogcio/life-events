import { Static } from "@sinclair/typebox";
import { Run } from "../../../routes/schemas";

export type RunDO = Static<typeof Run>;

export enum RunStatusEnum {
  PENDING = "pending",
  FAILED = "failed",
  COMPLETED = "completed",
}
