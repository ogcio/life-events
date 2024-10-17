import { STEP_STATUS } from "../../../app/types";
import { SubmissionData } from "../../../app/types/plugins";

export class IntegratorPlugin {
  public getStatus(): STEP_STATUS {
    throw new Error("Method 'getStatus()' must be implemented.");
  }

  public async execute(userId: string): Promise<unknown> {
    throw new Error("Method 'execute()' must be implemented.");
  }

  public async completeStep(
    data: Record<string, string>,
    userId: string,
  ): Promise<SubmissionData> {
    throw new Error("Method 'completeStep()' must be implemented.");
  }
}
