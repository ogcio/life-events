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
    "HOST",
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "POSTGRES_HOST",
    "POSTGRES_PORT",
    "POSTGRES_DB_NAME",
    "LOGTO_M2M_PROFILE_APP_SECRET",
    "LOGTO_M2M_PROFILE_APP_ID",
    "PROFILE_BACKEND_URL",
    "LOGTO_M2M_SCHEDULER_APP_SECRET",
    "LOGTO_M2M_SCHEDULER_APP_ID",
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
    HOST: { type: "string" },
    POSTGRES_USER: {
      type: "string",
    },
    POSTGRES_PASSWORD: {
      type: "string",
    },
    POSTGRES_HOST: {
      type: "string",
    },
    POSTGRES_PORT: {
      type: "number",
    },
    POSTGRES_DB_NAME: {
      type: "string",
    },
    LOGTO_M2M_PROFILE_APP_SECRET: {
      type: "string",
    },
    LOGTO_M2M_PROFILE_APP_ID: {
      type: "string",
    },
    PROFILE_BACKEND_URL: {
      type: "string",
    },
    LOGTO_M2M_SCHEDULER_APP_SECRET: {
      type: "string",
    },
    LOGTO_M2M_SCHEDULER_APP_ID: {
      type: "string",
    },
  },
};
