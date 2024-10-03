import createClient, { FetchResponse, type Middleware } from "openapi-fetch";
import type { paths } from "./schema.js";

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

export class Integrator {
  client: ReturnType<typeof createClient<paths>>;
  constructor(authToken: string) {
    const authMiddleware: Middleware = {
      async onRequest(req) {
        req.headers.set("Authorization", `Bearer ${authToken}`);
        return req;
      },
    };

    this.client = createClient<paths>({
      baseUrl: process.env.INTEGRATOR_BACKEND_URL,
    });
    this.client.use(authMiddleware);
  }

  /**
   * JOURNEYS
   */
  async getJourneyPublicInfo(
    journeyId: paths["/api/v1/journeys/{journeyId}/public-info"]["get"]["parameters"]["path"]["journeyId"],
  ) {
    return formatQueryResult(
      this.client.GET("/api/v1/journeys/{journeyId}/public-info", {
        params: {
          path: {
            journeyId,
          },
        },
      }),
    );
  }

  async getJourneyById(
    journeyId: paths["/api/v1/journeys/{journeyId}"]["get"]["parameters"]["path"]["journeyId"],
  ) {
    return formatQueryResult(
      this.client.GET("/api/v1/journeys/{journeyId}", {
        params: {
          path: {
            journeyId,
          },
        },
      }),
    );
  }

  async getJourneys() {
    return formatQueryResult(this.client.GET("/api/v1/journeys/", {}));
  }

  async createJourney(
    data: paths["/api/v1/journeys/"]["post"]["requestBody"]["content"]["application/json"],
  ) {
    return formatQueryResult(
      this.client.POST("/api/v1/journeys/", {
        body: data,
      }),
    );
  }

  async activateJourney(
    journeyId: paths["/api/v1/journeys/{journeyId}"]["patch"]["parameters"]["path"]["journeyId"],
    data: paths["/api/v1/journeys/{journeyId}"]["patch"]["requestBody"]["content"]["application/json"],
  ) {
    return formatQueryResult(
      this.client.PATCH("/api/v1/journeys/{journeyId}", {
        params: {
          path: { journeyId },
        },
        body: data,
      }),
    );
  }
}
