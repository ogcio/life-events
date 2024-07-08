export const envSchema = {
  type: "object",
  required: [
    "CLAMAV_HOST",
    "S3_ENDPOINT",
    "S3_REGION",
    "S3_BUCKET_NAME",
    "MAX_FILE_SIZE",
  ],
  properties: {
    CLAMAV_HOST: { type: "string" },
    S3_ENDPOINT: { type: "string" },
    S3_REGION: { type: "string" },
    S3_ACCESS_KEY_ID: { type: "string" },
    S3_SECRET_ACCESS_KEY: { type: "string" },
    S3_BUCKET_NAME: { type: "string" },
    MAX_FILE_SIZE: { type: "number" },
  },
};
