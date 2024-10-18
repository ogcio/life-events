import { IIntegratorPlugin, IntegratorProps } from "./basePlugin";
import { MessagingStepDataDO } from "../../../plugins/entities/journeySteps/types";

export class MessagePlugin implements IIntegratorPlugin {
  public async execute(
    stepData: MessagingStepDataDO,
    props: IntegratorProps,
  ): Promise<{ url: string }> {
    const url = new URL(`/journey/${props.journeyId}/callback`, props.host);
    url.searchParams.set("runId", props.runId);

    return {
      url: url.href,
    };
  }

  public processResultData(data: any) {
    return data;
  }
}
