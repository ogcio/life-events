const checkKey = (
  keyName: string,
  errors: string[],
  defaultValue?: string,
): string => {
  let value = process.env[keyName];
  if (!value && !defaultValue) {
    errors.push(keyName);
    return "";
  }

  if (defaultValue) {
    return defaultValue;
  }

  return value as string;
};

export const getS3ClientConfig = () => {
  const errors = [] as string[];
  const region = checkKey("S3_REGION", errors, "eu-west-1");
  const endpoint = checkKey("S3_ENDPOINT", errors);
  const accessKeyId = checkKey("S3_ACCESS_KEY_ID", errors);
  const secretAccessKey = checkKey("S3_SECRET_ACCESS_KEY", errors);
  const bucketName = checkKey("S3_BUCKET_NAME", errors, "life-events-files");

  if (errors.length) {
    throw new Error(`AWS Config. Missing following keys: ${errors.join(", ")}`);
  }

  return {
    config: {
      region,
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    },
    bucketName,
  };
};
