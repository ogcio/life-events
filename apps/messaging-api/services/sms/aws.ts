import { SMSService } from "../../routes";
import AWS from "aws-sdk";

export function awsSnsSmsService(
  accessKeyId: string,
  secretAccessKey: string,
): SMSService {
  const aws = new AWS.SNS({
    apiVersion: "latest",
    region: "eu-west-1",
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
