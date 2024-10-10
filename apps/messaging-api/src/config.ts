export const envSchema = {
  type: "object",
  required: [
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "POSTGRES_HOST",
    "POSTGRES_PORT",
    "POSTGRES_DB_NAME",
    "POSTGRES_DB_NAME_SHARED",
    "PROFILE_BACKEND_URL",
    "LOGTO_JWK_ENDPOINT",
    "LOGTO_OIDC_ENDPOINT",
    "LOGTO_API_RESOURCE_INDICATOR",
    "LOGTO_M2M_PROFILE_APP_SECRET",
    "LOGTO_M2M_PROFILE_APP_ID",
    "LOGTO_M2M_SCHEDULER_APP_SECRET",
    "LOGTO_M2M_SCHEDULER_APP_ID",
    "SCHEDULER_BACKEND_URL",
    "ORGANISATION_SETTINGS_URL",
    "UPLOAD_BACKEND_URL",
    "LOGTO_M2M_UPLOADER_APP_ID",
    "LOGTO_M2M_UPLOADER_APP_SECRET",
  ],
  properties: {
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
      type: "string",
    },
    POSTGRES_DB_NAME: {
      type: "string",
    },
    POSTGRES_DB_NAME_SHARED: {
      type: "string",
    },
    SYNCHRONOUS_USER_IMPORT: {
      type: "boolean",
      default: true,
    },
    PROFILE_BACKEND_URL: {
      type: "string",
      default: "http://localhost:8003",
    },
    LOGTO_JWK_ENDPOINT: {
      type: "string",
    },
    LOGTO_OIDC_ENDPOINT: {
      type: "string",
    },
    LOGTO_API_RESOURCE_INDICATOR: {
      type: "string",
    },
    LOGTO_M2M_PROFILE_APP_SECRET: {
      type: "string",
    },
    LOGTO_M2M_PROFILE_APP_ID: {
      type: "string",
    },
    LOGTO_M2M_SCHEDULER_APP_SECRET: {
      type: "string",
    },
    LOGTO_M2M_SCHEDULER_APP_ID: {
      type: "string",
    },
    SCHEDULER_BACKEND_URL: {
      type: "string",
    },
    ORGANISATION_SETTINGS_URL: {
      type: "string",
    },
    UPLOAD_BACKEND_URL: {
      type: "string",
    },
    LOGTO_M2M_UPLOADER_APP_ID: {
      type: "string",
    },
    LOGTO_M2M_UPLOADER_APP_SECRET: {
      type: "string",
    },
  },
};
