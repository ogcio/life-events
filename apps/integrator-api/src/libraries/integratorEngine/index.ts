import {
  JourneyStepTypesDO,
  StepDataDO,
} from "../../plugins/entities/journeySteps/types";
import integratorPluginManager from "./plugins";
import { IIntegratorPlugin } from "./plugins/basePlugin";

class IntegratorEngine {
  private readonly plugin: IIntegratorPlugin;

  constructor(stepType: JourneyStepTypesDO) {
    this.plugin = integratorPluginManager.getPlugin(stepType);
  }

  public executeStep(data: StepDataDO): Promise<{ url: string }> {
    return this.plugin.execute(data);
  }
}

export default IntegratorEngine;
