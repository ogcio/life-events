export const envSchema = {
  type: "object",
  required: [
    "CLAMAV_HOST",
    "S3_ENDPOINT",
    "S3_REGION",
    "S3_BUCKET_NAME",
    "MAX_FILE_SIZE",
    "LOGTO_JWK_ENDPOINT",
    "LOGTO_OIDC_ENDPOINT",
    "LOGTO_API_RESOURCE_INDICATOR",
  ],
  properties: {
    CLAMAV_HOST: { type: "string" },
    S3_ENDPOINT: { type: "string" },
    S3_REGION: { type: "string" },
    S3_ACCESS_KEY_ID: { type: "string" },
    S3_SECRET_ACCESS_KEY: { type: "string" },
    S3_BUCKET_NAME: { type: "string" },
    MAX_FILE_SIZE: { type: "number" },
    LOGTO_JWK_ENDPOINT: { type: "string" },
    LOGTO_OIDC_ENDPOINT: { type: "string" },
    LOGTO_API_RESOURCE_INDICATOR: { type: "string" },
  },
};
