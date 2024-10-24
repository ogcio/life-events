export const envSchema = {
  type: "object",
  required: [
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "POSTGRES_HOST",
    "POSTGRES_PORT",
    "POSTGRES_DB_NAME",
    "POSTGRES_DB_NAME_SHARED",
    "LOGTO_JWK_ENDPOINT",
    "LOGTO_OIDC_ENDPOINT",
    "LOGTO_API_RESOURCE_INDICATOR",
    "LOGTO_M2M_PROFILE_APP_ID",
    "LOGTO_M2M_PROFILE_APP_SECRET",
    "PAYMENTS_SERVICE_URL",
    "FORMS_SERVICE_URL",
    "FORMS_SECRET_API_KEY",
    "FORMS_PUBLIC_API_KEY",
    "AWS_REGION",
    // "KMS_ENDPOINT", - required only locally with value http://localhost:4566 for localstack
    "INTEGRATOR_URL",
    "PROFILE_BACKEND_URL",
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
    LOGTO_JWK_ENDPOINT: {
      type: "string",
    },
    LOGTO_OIDC_ENDPOINT: {
      type: "string",
    },
    LOGTO_API_RESOURCE_INDICATOR: {
      type: "string",
    },
    LOGTO_M2M_PROFILE_APP_ID: {
      type: "string",
    },
    LOGTO_M2M_PROFILE_APP_SECRET: {
      type: "string",
    },
    PAYMENTS_SERVICE_URL: {
      type: "string",
    },
    FORMS_SERVICE_URL: {
      type: "string",
    },
    FORMS_SECRET_API_KEY: {
      type: "string",
    },
    FORMS_PUBLIC_API_KEY: {
      type: "string",
    },
    AWS_REGION: {
      type: "string",
    },
    KMS_ENDPOINT: {
      type: "string",
    },
    INTEGRATOR_URL: {
      type: "string",
    },
    PROFILE_BACKEND_URL: {
      type: "string",
    },
  },
};
