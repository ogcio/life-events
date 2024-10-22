import {
  FormStepDataDO,
  JourneyStepDO,
} from "../../plugins/entities/journeySteps/types";
import { IExternalService } from "./types";

export class FormService implements IExternalService {
  private readonly getSchemaPath = (id: string) =>
    `/api/v3/public/forms/${id}/schema`;
  private readonly getAccessTokenPath = "/api/v3/public/token";

  private async getAccessToken() {
    const url = new URL(this.getAccessTokenPath, process.env.FORMS_SERVICE_URL);
    const authToken = `Basic ${Buffer.from(
      `${process.env.FORMS_PUBLIC_API_KEY}:${process.env.FORMS_SECRET_API_KEY}`,
    ).toString("base64")}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
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

  async getSchema(id?: string) {
    if (!id) {
      throw new Error("Form id not specified.");
    }

    const url = new URL(
      `${this.getSchemaPath(id)}`,
      process.env.FORMS_SERVICE_URL,
    );
    const token = await this.getAccessToken();

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.accessToken}`,
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
    return (step.stepData as FormStepDataDO).url;
  }
}
