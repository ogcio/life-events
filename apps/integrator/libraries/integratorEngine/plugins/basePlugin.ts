import { STEP_STATUS } from "../../../app/types";
import { SubmissionData } from "../../../app/types/plugins";

export class IntegratorPlugin {
  public getStatus(): STEP_STATUS {
    throw new Error("Method 'execute()' must be implemented.");
  }

  public execute(): Promise<unknown> {
    throw new Error("Method 'execute()' must be implemented.");
  }

  public processData(data: Record<string, string>): SubmissionData {
    throw new Error("Method 'execute()' must be implemented.");
  }
}
