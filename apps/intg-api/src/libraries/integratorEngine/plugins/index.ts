import { JourneyStepTypesDO } from "../../../plugins/entities/journeySteps/types";
import { IIntegratorPlugin } from "./basePlugin";
import { FormPlugin } from "./formPlugin";
import { MessagePlugin } from "./messagePlugin";
import { PaymentPlugin } from "./paymentPlugin";

const issuerPluginsMap = {
  "formsie-api": FormPlugin,
  "payments-api": PaymentPlugin,
};
export type IssuerPluginKeys = keyof typeof issuerPluginsMap;

class IntegratorPluginManager {
  private readonly pluginsMap = {
    form: FormPlugin,
    payment: PaymentPlugin,
    messaging: MessagePlugin,
  };

  getPlugin(stepType: JourneyStepTypesDO): IIntegratorPlugin {
    const pluginClass = this.pluginsMap[stepType];
    if (!pluginClass) {
      throw new Error("Plugin not found!");
    }

    return new pluginClass();
  }

  getPluginFromIssuer(issuer: IssuerPluginKeys) {
    const pluginClass = issuerPluginsMap[issuer];
    if (!pluginClass) {
      throw new Error("Plugin not found!");
    }

    return new pluginClass();
  }
}

const integratorPluginManager = new IntegratorPluginManager();
export default integratorPluginManager;
