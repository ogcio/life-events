import { Analytics } from "./analytics/index.js";
import {
  getOrganizationToken,
  GetOrganizationTokenParams,
} from "./auth/index.js";

export { Analytics };

export class OGCIO {
  analytics: Analytics;

  constructor() {
    this.analytics = new Analytics(process.env.ANALYTICS_URL!);
  }

  private async initializeAuthToken({
    logtoOidcEndpoint,
    applicationId,
    applicationSecret,
    scopes,
    organizationId,
  }: Partial<GetOrganizationTokenParams>) {
    const token = await getOrganizationToken({
      logtoOidcEndpoint: logtoOidcEndpoint ?? process.env.AUTH_OIDC_ENDPOINT!,
      applicationId: applicationId ?? process.env.AUTH_APP_ID!,
      applicationSecret: applicationSecret ?? process.env.AUTH_APP_SECRET!,
      scopes: scopes
        ? scopes
        : process.env.AUTH_SCOPES
          ? process.env.AUTH_SCOPES.split(",")
          : [],
      organizationId: organizationId ?? process.env.AUTH_ORGANIZATION_ID!,
    });

    return token;
  }

  async auth(options?: Partial<GetOrganizationTokenParams>) {
    const token = await this.initializeAuthToken(options ?? {});

    // Analytics auth config
    this.analytics.setAuthToken(token);
    if (process.env.ANALYTICS_MATOMO_TOKEN) {
      this.analytics.setMatomoToken(process.env.ANALYTICS_MATOMO_TOKEN);
    }

    // other configs ...
  }
}
