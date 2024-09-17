import { redirect } from "next/navigation";
import { JourneyStep, STEP_TYPE } from "../../../../../types";
import {
  FormPluginData,
  PaymentPluginData,
} from "../../../../../types/plugins";

const pluginRunner = (plugin: JourneyStep) => {
  const pluginType = plugin.stepType;

  switch (pluginType) {
    case STEP_TYPE.FORM: {
      // redirect to form
      const { formsUrl } = plugin.stepData as FormPluginData;
      return redirect(formsUrl);
    }
    case STEP_TYPE.PAYMENT: {
      const { paymentsUrl } = plugin.stepData as PaymentPluginData;
      return redirect(paymentsUrl);
    }
    case STEP_TYPE.MESSAGING: {
      //execute messaging
    }
  }
};

export default pluginRunner;
