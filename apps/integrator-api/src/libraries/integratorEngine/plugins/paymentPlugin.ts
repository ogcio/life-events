import { PaymentStepDataDO } from "../../../plugins/entities/journeySteps/types";
import { IIntegratorPlugin } from "./basePlugin";

export class PaymentPlugin implements IIntegratorPlugin {
  public async execute(stepData: PaymentStepDataDO): Promise<{ url: string }> {
    const { url } = stepData;
    return { url };
  }
}
