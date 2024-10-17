import { IIntegratorPlugin } from "./basePlugin";
import { MessagingStepDataDO } from "../../../plugins/entities/journeySteps/types";

export class MessagePlugin implements IIntegratorPlugin {
  public async execute(
    stepData: MessagingStepDataDO,
  ): Promise<{ url: string }> {
    return { url: "" };
  }
}
