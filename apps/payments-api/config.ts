export const envSchema = {
  type: "object",
  required: [
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "POSTGRES_HOST",
    "POSTGRES_PORT",
    "POSTGRES_DB_NAME",
    "POSTGRES_DB_NAME_SHARED",
    "PAYMENT_INTENTID_LENGTH",
    "PAYMENT_INTENTID_MAX_TRY_GENERATION",
    "PAYMENTS_PROVIDERS_ENCRYPTION_KEY",
    "REALEX_PAYMENT_ACCOUNT",
    "REALEX_PAYMENT_URL",
    "PAYMENTS_HOST_URL",
    "AUTH_SERVICE_URL",
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
    PAYMENT_INTENTID_LENGTH: {
      type: "string",
    },
    PAYMENT_INTENTID_MAX_TRY_GENERATION: {
      type: "string",
    },
    PAYMENTS_PROVIDERS_ENCRYPTION_KEY: {
      type: "string",
    },
    REALEX_PAYMENT_ACCOUNT: {
      type: "string",
    },
    REALEX_PAYMENT_URL: {
      type: "string",
    },
    PAYMENTS_HOST_URL: {
      type: "string",
    },
    AUTH_SERVICE_URL: {
      type: "string",
    },
  },
};
