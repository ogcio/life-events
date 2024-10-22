import { Static } from "@sinclair/typebox";
import {
  CreateJourneyStep,
  FormStepData,
  JourneyStep,
  JourneyStepTypes,
  MessagingStepData,
  PaymentStepData,
  StepData,
  UpdateJourneyStep,
} from "../../../routes/schemas";

export type JourneyStepTypesDO = Static<typeof JourneyStepTypes>;
export type JourneyStepDO = Static<typeof JourneyStep>;
export type CreateJourneyStepDO = Static<typeof CreateJourneyStep>;
export type UpdateJourneyStepDO = Static<typeof UpdateJourneyStep>;

export type FormStepDataDO = Static<typeof FormStepData>;
export type PaymentStepDataDO = Static<typeof PaymentStepData>;
export type MessagingStepDataDO = Static<typeof MessagingStepData>;
export type StepDataDO = Static<typeof StepData>;
