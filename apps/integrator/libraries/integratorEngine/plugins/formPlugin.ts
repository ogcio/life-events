import { redirect } from "next/navigation";
import { JourneyStep, STEP_STATUS, SubmissionStep } from "../../../app/types";
import { FormPluginData, FormSubmissionData } from "../../../app/types/plugins";
import { IntegratorPlugin } from "./basePlugin";
import { updateSubmissionStep } from "../../../app/utils/submissions";
import { Pool } from "pg";

export class FormPlugin extends IntegratorPlugin {
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

  public async execute(userId: string): Promise<never> {
    const { url } = this.step.stepData as FormPluginData;
    return redirect(url);
  }

  public async completeStep(
    data: Record<string, string>,
    userId: string,
  ): Promise<FormSubmissionData> {
    const submissionData = {
      success: true,
      submissionId: data["submissionId"],
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
