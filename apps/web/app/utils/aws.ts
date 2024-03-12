export const s3ClientConfig = {
  region: "eu-west-1",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: "accessKeyId",
    secretAccessKey: "accessKeyId",
  },
};

export const fileBucketName = "life-events-files"; // use env later?
