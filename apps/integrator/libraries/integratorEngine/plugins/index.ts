import { JourneyStep, SubmissionStep } from "../../../app/types";
import { FormPlugin } from "./formPlugin";
import { MessagePlugin } from "./messagePlugin";
import { PaymentPlugin } from "./paymentPlugin";

export class IntegratorPluginManager {
  private readonly pluginsMap = {
    form: FormPlugin,
    payment: PaymentPlugin,
    messaging: MessagePlugin,
  };

  getPlugin(step: JourneyStep, submissionStep: SubmissionStep) {
    const pluginClass = this.pluginsMap[step.stepType];
    if (!pluginClass) {
      throw new Error("Plugin not found!");
    }

    return new pluginClass(step, submissionStep);
  }
}
