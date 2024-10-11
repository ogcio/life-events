import {
  JourneyStepDO,
  MessagingStepDataDO,
} from "../plugins/entities/journeySteps/types";
import { IService } from "./types";

export class MessagingService implements IService {
  async getSchema() {
    return Promise.resolve({});
  }

  async getData() {
    return Promise.resolve({});
  }

  getStepResourceId(step: JourneyStepDO) {
    return "";
    // return (step.stepData as MessagingStepDataDO).templateId;
  }
}
