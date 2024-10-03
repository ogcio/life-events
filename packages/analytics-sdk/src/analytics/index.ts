import { FetchResponse, Middleware } from "openapi-fetch";
import { BaseClient } from "../baseClient.js";
import type { paths } from "./schema.js";

/*
 *
 * @note This is a workaround to correctly get the keyname of the "x-matomo-token" header from the create website endpoint.
 *       and be type-safe, since we know that the /api/v1/websites/ endpoint has the "x-matomo-token" header.
 *       So even if in the future the name of the header changes, the SDK will be aware of that and will not break.
 */
type CreateWebsiteHeadersKeys = keyof NonNullable<
  paths["/api/v1/websites/"]["post"]["parameters"]["header"]
>;

const formatQueryResult = async <T, O>(
  promise: Promise<FetchResponse<T, O, "application/json">>,
) => {
  try {
    const result = await promise;

    return { data: result.data, error: result.error };
  } catch (error) {
    return { data: undefined, error };
  }
};

export class Analytics extends BaseClient<paths> {
  private matomoToken?: string;

  constructor(baseUrl: string) {
    super(baseUrl);
  }

  private matomoAuthMiddleware: Middleware = {
    async onRequest({ request }) {
      const headerTokenName =
        "x-matomo-token" satisfies CreateWebsiteHeadersKeys;

      request.headers.set(headerTokenName, this.matomoToken || "");
      return request;
    },
  };

  setMatomoToken(matomoToken: string) {
    this.matomoToken = matomoToken;
    this.client.use(this.matomoAuthMiddleware);
  }

  async getWebsites() {
    return formatQueryResult(this.client.GET("/api/v1/websites/"));
  }

  async getWebsiteById(
    id: paths["/api/v1/websites/{id}"]["get"]["parameters"]["path"]["id"],
  ) {
    return formatQueryResult(
      this.client.GET("/api/v1/websites/{id}", {
        params: {
          path: {
            id,
          },
        },
      }),
    );
  }

  async createWebsite(
    data: paths["/api/v1/websites/"]["post"]["requestBody"]["content"]["application/json"],
  ) {
    return formatQueryResult(
      this.client.POST("/api/v1/websites/", {
        body: data,
      }),
    );
  }

  async updateWebsite(
    id: paths["/api/v1/websites/{id}"]["patch"]["parameters"]["path"]["id"],
    data: NonNullable<
      paths["/api/v1/websites/{id}"]["patch"]["requestBody"]
    >["content"]["application/json"],
  ) {
    return formatQueryResult(
      this.client.PATCH("/api/v1/websites/{id}", {
        params: {
          path: {
            id,
          },
        },
        body: data,
      }),
    );
  }

  async getTrackingCode(
    id: paths["/api/v1/websites/{id}/tracking-code"]["get"]["parameters"]["path"]["id"],
    query: paths["/api/v1/websites/{id}/tracking-code"]["get"]["parameters"]["query"],
  ) {
    return formatQueryResult(
      this.client.GET("/api/v1/websites/{id}/tracking-code", {
        params: {
          path: {
            id,
          },
        },
        query,
      }),
    );
  }

  async trackEvent(
    id: paths["/api/v1/websites/{id}"]["patch"]["parameters"]["path"]["id"],
    data: paths["/api/v1/websites/{id}/track-event"]["post"]["requestBody"]["content"]["application/json"],
    options: paths["/api/v1/websites/{id}/track-event"]["post"]["parameters"]["query"] = {},
  ) {
    return formatQueryResult(
      this.client.POST("/api/v1/websites/{id}/track-event", {
        params: {
          path: {
            id,
          },
        },
        body: data,
        query: options,
      }),
    );
  }

  async trackPageView(
    id: paths["/api/v1/websites/{id}/track-page-view"]["post"]["parameters"]["path"]["id"],
    data: paths["/api/v1/websites/{id}/track-page-view"]["post"]["requestBody"]["content"]["application/json"],
    options: paths["/api/v1/websites/{id}/track-page-view"]["post"]["parameters"]["query"] = {},
  ) {
    return formatQueryResult(
      this.client.POST("/api/v1/websites/{id}/track-page-view", {
        params: {
          path: {
            id,
          },
        },
        body: data,
        query: options,
      }),
    );
  }

  async trackSiteSearch(
    id: paths["/api/v1/websites/{id}/track-site-search"]["post"]["parameters"]["path"]["id"],
    data: paths["/api/v1/websites/{id}/track-site-search"]["post"]["requestBody"]["content"]["application/json"],
    options: paths["/api/v1/websites/{id}/track-site-search"]["post"]["parameters"]["query"] = {},
  ) {
    return formatQueryResult(
      this.client.POST("/api/v1/websites/{id}/track-site-search", {
        params: {
          path: {
            id,
          },
        },
        body: data,
        query: options,
      }),
    );
  }

  async trackOutLink(
    id: paths["/api/v1/websites/{id}/track-out-link"]["post"]["parameters"]["path"]["id"],
    data: paths["/api/v1/websites/{id}/track-out-link"]["post"]["requestBody"]["content"]["application/json"],
    options: paths["/api/v1/websites/{id}/track-out-link"]["post"]["parameters"]["query"] = {},
  ) {
    return formatQueryResult(
      this.client.POST("/api/v1/websites/{id}/track-out-link", {
        params: {
          path: {
            id,
          },
        },
        body: data,
        query: options,
      }),
    );
  }
}
