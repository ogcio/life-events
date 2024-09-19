import { redirect } from "next/navigation";
import { JourneyStep, STEP_STATUS, SubmissionStep } from "../../../app/types";
import {
  PaymentPluginData,
  PaymentSubmissionData,
} from "../../../app/types/plugins";
import { IntegratorPlugin } from "./basePlugin";

export class PaymentPlugin extends IntegratorPlugin {
  private step: JourneyStep;
  private submissionStep: SubmissionStep;

  constructor(step: JourneyStep, submissionStep: SubmissionStep) {
    super();

    this.step = step;
    this.submissionStep = submissionStep;
  }

  public getStatus(): STEP_STATUS {
    return this.submissionStep.status;
  }

  public async execute(): Promise<never> {
    const { url } = this.step.stepData as PaymentPluginData;
    return redirect(url);
  }

  public processData(data: Record<string, string>): PaymentSubmissionData {
    return {
      success: true,
    };
  }
}
