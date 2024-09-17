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
      const { url } = plugin.stepData as FormPluginData;
      return redirect(url);
    }
    case STEP_TYPE.PAYMENT: {
      const { url } = plugin.stepData as PaymentPluginData;
      return redirect(url);
    }
    case STEP_TYPE.MESSAGING: {
      //execute messaging
    }
  }
};

export default pluginRunner;
