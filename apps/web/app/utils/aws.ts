import { S3Client } from "@aws-sdk/client-s3";

const checkKey = (params: {
  keyName: string;
  errors: string[];
  required?: boolean;
  defaultValue?: string;
}): string | undefined => {
  let value = process.env[params.keyName];
  if (!(params.required ?? true)) {
    return value;
  }

  if (!value && !params.defaultValue) {
    params.errors.push(params.keyName);
    return undefined;
  }

  if (params.defaultValue) {
    return params.defaultValue;
  }

  return value as string;
};

export interface S3ClientConfig {
  config: {
    region: string;
    endpoint: string;
    forcePathStyle: boolean;
    credentials?: {
      accessKeyId: string;
      secretAccessKey: string;
    };
  };
  bucketName: string;
  client: S3Client;
}

export const getS3ClientConfig = (): S3ClientConfig => {
  const errors = [] as string[];
  const region = checkKey({
    keyName: "S3_REGION",
    errors,
    defaultValue: "eu-west-1",
  }) as string;
  const endpoint = checkKey({ keyName: "S3_ENDPOINT", errors }) as string;
  const accessKeyId = checkKey({
    keyName: "S3_ACCESS_KEY_ID",
    errors,
    required: false,
  });
  const secretAccessKey = checkKey({
    keyName: "S3_SECRET_ACCESS_KEY",
    errors,
    required: false,
  });
  const bucketName = checkKey({
    keyName: "S3_BUCKET_NAME",
    errors,
    defaultValue: "life-events-files",
  }) as string;

  if (errors.length) {
    throw new Error(`AWS Config. Missing following keys: ${errors.join(", ")}`);
  }
  const config = {
    region,
    endpoint,
    forcePathStyle: true,
  } as any;

  if (accessKeyId && secretAccessKey) {
    config.credentials = {
      accessKeyId,
      secretAccessKey,
    };
  }

  const output: S3ClientConfig = {
    config,
    bucketName,
    client: new S3Client(config),
  };

  return output;
};
