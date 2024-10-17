import { URL } from "url";
import { IExternalService } from "./types";
import {
  JourneyStepDO,
  PaymentStepDataDO,
} from "../../plugins/entities/journeySteps/types";

export class PaymentService implements IExternalService {
  private readonly getSchemaPath = "/api/v1/transactions/schema";

  async getSchema() {
    const url = new URL(
      `${this.getSchemaPath}`,
      process.env.PAYMENTS_SERVICE_URL,
    );

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();
      return json;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  getStepResourceId(step: JourneyStepDO) {
    return (step.stepData as PaymentStepDataDO).url;
  }
}
