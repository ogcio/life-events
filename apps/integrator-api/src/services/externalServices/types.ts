import { JourneyStepDO } from "../../plugins/entities/journeySteps/types";

export interface IExternalService {
  getSchema: (id?: string) => Promise<Record<string, unknown> | void>;
  getStepResourceId: (step: JourneyStepDO) => string | void;
}
