import { Pool } from "pg";
import { JourneyStep, STEP_STATUS, SubmissionStep } from "../../../app/types";
import {
  MessagingPluginData,
  MessagingSubmissionData,
} from "../../../app/types/plugins";
import { IntegratorPlugin } from "./basePlugin";
import { updateSubmissionStep } from "../../../app/utils/submissions";
import { MessagingAuthenticationFactory } from "../../messaging-authentication-factory";

export class MessagePlugin extends IntegratorPlugin {
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

  public async execute(userId: string): Promise<void> {
    const data = this.step.stepData as MessagingPluginData;
    const client = await MessagingAuthenticationFactory.getMessagingClient();

    await client.send({
      bypassConsent: false,
      message: {
        threadName: "Submission completed",
        subject: "Submission completed",
        excerpt:
          "Dear customer, we trust this message finds you well. We are pleased to inform you that your recent request has been successfully processed. Should you require any further assistance or have any additional inquiries, please don’t hesitate to reach out. Best, Department of Something",
        richText:
          "Dear customer, we trust this message finds you well. We are pleased to inform you that your recent request has been successfully processed. Should you require any further assistance or have any additional inquiries, please don’t hesitate to reach out. Best, Department of Something",
        plainText:
          "Dear customer, we trust this message finds you well. We are pleased to inform you that your recent request has been successfully processed. Should you require any further assistance or have any additional inquiries, please don’t hesitate to reach out. Best, Department of Something",
        language: "en",
      },
      preferredTransports: ["lifeEvent"],
      scheduleAt: "2024-09-20T15:49:16+03:00",
      security: "public",
      recipientUserId: "e4b73033-4d53-4c7c-8e4d-8cce2416b028",
    });

    await this.completeStep({}, userId);
    return Promise.resolve();
  }

  public async completeStep(
    data: Record<string, string>,
    userId: string,
  ): Promise<MessagingSubmissionData> {
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
