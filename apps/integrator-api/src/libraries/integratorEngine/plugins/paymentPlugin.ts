import { PaymentStepDataDO } from "../../../plugins/entities/journeySteps/types";
import { IIntegratorPlugin, IntegratorProps } from "./basePlugin";

export class PaymentPlugin implements IIntegratorPlugin {
  public async execute(
    stepData: PaymentStepDataDO,
    props: IntegratorProps,
  ): Promise<{ url: string }> {
    const url = new URL(stepData.url);
    url.searchParams.set("journeyId", props.journeyId);
    url.searchParams.set("runId", props.runId);

    return { url: url.href };
  }

  public processResultData(data: any) {
    return data;
  }
}
