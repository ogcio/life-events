import type { S3Client } from "@aws-sdk/client-s3";

type S3Config = {
  region: string;
  endpoint: string;
  forcePathStyle: boolean;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
};

export type S3ClientConfig = {
  config: S3Config;
  bucketName: string;
  client: S3Client;
};
