import { FormStepDataDO } from "../../../plugins/entities/journeySteps/types";
import { IIntegratorPlugin } from "./basePlugin";

export class FormPlugin implements IIntegratorPlugin {
  public async execute(stepData: FormStepDataDO): Promise<{ url: string }> {
    const { url } = stepData;
    return { url };
  }

  public processResultData(data: any) {
    return data;
  }
}
