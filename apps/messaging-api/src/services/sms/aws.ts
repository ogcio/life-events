import { SMSService } from "../../routes/index.js";
import { SNS } from "@aws-sdk/client-sns";

export function awsSnsSmsService(
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
): SMSService {
  const aws = new SNS({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });

  return {
    async Send(message: string, E164number: string) {
      return new Promise<void>((resolve, reject) =>
        aws.publish({ Message: message, PhoneNumber: E164number }, (err) => {
          if (err) {
            reject(err);
          }
          resolve();
        }),
      );
    },
  };
}
