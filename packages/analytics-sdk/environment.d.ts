declare namespace NodeJS {
  interface ProcessEnv {
    ANALYTICS_URL: string;
    AUTH_OIDC_ENDPOINT: string;
    AUTH_APP_ID: string;
    AUTH_APP_SECRET: string;
    AUTH_ORGANIZATION_ID: string;
    AUTH_SCOPES: string;
  }
}
