import { JourneyStepDO } from "../plugins/entities/journeySteps/types";

export interface IService {
  getSchema: (id?: string) => Promise<Record<string, unknown>>;
  getData: (id: string) => Promise<Record<string, unknown>>;
  getStepResourceId: (step: JourneyStepDO) => string;
}
