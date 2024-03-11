export const s3ClientConfig = {
  region: "eu-west-1",
  endpoint: `http://localstack:4566`,
  forcePathStyle: true,
  credentials: {
    accessKeyId: "accessKeyId",
    secretAccessKey: "accessKeyId",
  },
};

export const fileBucketName = "life-events-files"; // use env later?
