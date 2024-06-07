export const envSchema = {
  type: "object",
  required: [
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "POSTGRES_HOST",
    "POSTGRES_PORT",
    "POSTGRES_DB_NAME_SHARED",
    "REDIRECT_TIMEOUT",
    "CALLBACK_URL",
    "CLIENT_ID",
    "MYGOVID_URL",
    "CLIENT_SECRET",
    "TOKEN_URL",
    "ALLOWED_REDIRECT_HOSTS",
    "MYGOVID_MOCK_URL",
    "JWK_PUBLIC_KEY",
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
    POSTGRES_DB_NAME_SHARED: {
      type: "string",
    },
    REDIRECT_TIMEOUT: {
      type: "number",
    },
    MYGOVID_URL: {
      type: "string",
    },
    CLIENT_ID: {
      type: "string",
    },
    CALLBACK_URL: {
      type: "string",
    },
    CLIENT_SECRET: {
      type: "string",
    },
    TOKEN_URL: {
      type: "string",
    },
    ALLOWED_REDIRECT_HOSTS: {
      type: "string",
    },
    MYGOVID_MOCK_URL: {
      type: "string",
    },
    JWK_PUBLIC_KEY: {
      type: "string",
    },
  },
};
