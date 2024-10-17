import { StepDataDO } from "../../../plugins/entities/journeySteps/types";

export interface IIntegratorPlugin {
  execute(stepData: StepDataDO): Promise<{ url: string }>;
}
