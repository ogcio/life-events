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
  },
};
