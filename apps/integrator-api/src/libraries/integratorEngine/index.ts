import { JourneyStepConnectionDO } from "../../plugins/entities/journeyStepConnections/types";
import {
  JourneyStepTypesDO,
  StepDataDO,
} from "../../plugins/entities/journeySteps/types";
import integratorPluginManager from "./plugins";
import { IIntegratorPlugin } from "./plugins/basePlugin";

class IntegratorEngine {
  private readonly plugin: IIntegratorPlugin;

  private readonly journeyId: string;
  private readonly runId: string;
  private readonly host: string;

  constructor(
    stepType: JourneyStepTypesDO,
    journeyId: string,
    runId: string,
    host: string,
  ) {
    this.plugin = integratorPluginManager.getPlugin(stepType);
    this.journeyId = journeyId;
    this.runId = runId;
    this.host = host;
  }

  public executeStep(data: StepDataDO): Promise<{ url: string }> {
    return this.plugin.execute(data, {
      journeyId: this.journeyId,
      runId: this.runId,
      host: this.host,
    });
  }

  public processResultData(data: any) {
    return this.plugin.processResultData(data, {
      journeyId: this.journeyId,
      runId: this.runId,
      host: this.host,
    });
  }

  public getNextStep(
    currentStepId: string,
    connections: JourneyStepConnectionDO[],
  ): string | undefined {
    return connections.find((connection) => {
      return connection.sourceStepId === currentStepId;
    })?.destinationStepId;
  }
}

export default IntegratorEngine;
