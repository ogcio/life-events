import { IIntegratorPlugin, IntegratorProps } from "./basePlugin";
import { MessagingStepDataDO } from "../../../plugins/entities/journeySteps/types";
import { getMessagingSdk } from "../../../utils/authenticationFactory";

export class MessagePlugin implements IIntegratorPlugin {
  public async execute(
    stepData: MessagingStepDataDO,
    props: IntegratorProps,
  ): Promise<{ url: string }> {
    const client = await getMessagingSdk();
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
      scheduleAt: new Date().toISOString(),
      security: "public",
      recipientUserId: "e4b73033-4d53-4c7c-8e4d-8cce2416b028",
    });

    const url = new URL(`/journey/${props.journeyId}/callback`, props.host);
    url.searchParams.set("runId", props.runId);

    return {
      url: url.href,
    };
  }

  public processResultData(data: any) {
    return data;
  }
}
