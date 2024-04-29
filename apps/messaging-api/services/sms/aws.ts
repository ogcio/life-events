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
    async Send(message: string, _: string, E164numbers: string[]) {
      void Promise.allSettled(
        E164numbers.map((number) =>
          aws
            .publish({
              Message: message,
              PhoneNumber: number,
            })
            .promise()
            .then(console.log)
            .catch(console.error),
        ),
      );
    },
  };
}
