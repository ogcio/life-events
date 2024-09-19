import { JourneyStep, SubmissionStep } from "../../../app/types";
import { IntegratorPlugin } from "./basePlugin";

export class MessagePlugin extends IntegratorPlugin {
  private step: JourneyStep;
  private submissionStep: SubmissionStep;

  constructor(step: JourneyStep, submissionStep: SubmissionStep) {
    super();

    this.step = step;
    this.submissionStep = submissionStep;
  }
}
