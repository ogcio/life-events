import { redirect } from "next/navigation";
import { JourneyStep, STEP_STATUS, SubmissionStep } from "../../../app/types";
import {
  PaymentPluginData,
  PaymentSubmissionData,
} from "../../../app/types/plugins";
import { IntegratorPlugin } from "./basePlugin";
import { Pool } from "pg";
import { updateSubmissionStep } from "../../../app/utils/submissions";

export class PaymentPlugin extends IntegratorPlugin {
  private step: JourneyStep;
  private submissionStep: SubmissionStep;
  private pgpool: Pool;

  constructor(step: JourneyStep, submissionStep: SubmissionStep, pgpool: Pool) {
    super();

    this.pgpool = pgpool;
    this.step = step;
    this.submissionStep = submissionStep;
  }

  public getStatus(): STEP_STATUS {
    return this.submissionStep.status;
  }

  public async execute(userId: string): Promise<any> {
    const { url } = this.step.stepData as PaymentPluginData;
    return redirect(url);
  }

  public async completeStep(
    data: Record<string, string>,
    userId: string,
  ): Promise<PaymentSubmissionData> {
    const submissionData = {
      success: true,
    };

    await updateSubmissionStep(
      this.pgpool,
      this.submissionStep.submissionId,
      this.step.id,
      userId,
      submissionData,
    );

    return submissionData;
  }
}
