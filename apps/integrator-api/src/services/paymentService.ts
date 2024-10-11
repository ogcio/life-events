import { URL } from "url";
import { IService } from "./types";
import {
  JourneyStepDO,
  PaymentStepDataDO,
} from "../plugins/entities/journeySteps/types";

export class PaymentService implements IService {
  private readonly getSchemaPath = "/api/v1/transactions/schema";
  private readonly getDataPath = (id: string) =>
    `/api/v1/transactions/data/${id}`;

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

  async getData(transactionId: string) {
    const url = new URL(
      `${this.getDataPath(transactionId)}`,
      process.env.PAYMENTS_SERVICE_URL,
    );
    return Promise.resolve({});
  }

  getStepResourceId(step: JourneyStepDO) {
    return (step.stepData as PaymentStepDataDO).url;
  }
}
