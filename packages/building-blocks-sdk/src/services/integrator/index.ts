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
   * JOURNEY STEP CONNECTIONS
   */
  async getConnectionById(
    connectionId: paths["/api/v1/journey_step_connections/{connectionId}"]["get"]["parameters"]["path"]["connectionId"],
  ) {
    return formatQueryResult(
      this.client.GET("/api/v1/journey_step_connections/{connectionId}", {
        params: {
          path: {
            connectionId,
          },
        },
      }),
    );
  }

  async createConnection(
    data: paths["/api/v1/journey_step_connections/"]["post"]["requestBody"]["content"]["application/json"],
  ) {
    return formatQueryResult(
      this.client.POST("/api/v1/journey_step_connections/", {
        body: data,
      }),
    );
  }

  async deleteConnection(
    connectionId: paths["/api/v1/journey_step_connections/{connectionId}"]["delete"]["parameters"]["path"]["connectionId"],
  ) {
    return formatQueryResult(
      this.client.DELETE("/api/v1/journey_step_connections/{connectionId}", {
        params: {
          path: {
            connectionId,
          },
        },
      }),
    );
  }

  /**
   * JOURNEY STEPs
   */
  async getStepById(
    stepId: paths["/api/v1/journey_steps/{stepId}"]["get"]["parameters"]["path"]["stepId"],
  ) {
    return formatQueryResult(
      this.client.GET("/api/v1/journey_steps/{stepId}", {
        params: {
          path: {
            stepId,
          },
        },
      }),
    );
  }

  async createStep(
    data: paths["/api/v1/journey_steps/"]["post"]["requestBody"]["content"]["application/json"],
  ) {
    return formatQueryResult(
      this.client.POST("/api/v1/journey_steps/", {
        body: data,
      }),
    );
  }

  async deleteStep(
    stepId: paths["/api/v1/journey_steps/{stepId}"]["delete"]["parameters"]["path"]["stepId"],
  ) {
    return formatQueryResult(
      this.client.DELETE("/api/v1/journey_steps/{stepId}", {
        params: {
          path: {
            stepId,
          },
        },
      }),
    );
  }

  async updateStep(
    stepId: paths["/api/v1/journey_steps/{stepId}"]["put"]["parameters"]["path"]["stepId"],
    data: paths["/api/v1/journey_steps/{stepId}"]["put"]["requestBody"]["content"]["application/json"],
  ) {
    return formatQueryResult(
      this.client.PUT("/api/v1/journey_steps/{stepId}", {
        params: {
          path: {
            stepId,
          },
        },
        body: data,
      }),
    );
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
    journeyId: paths["/api/v1/journeys/{journeyId}"]["put"]["parameters"]["path"]["journeyId"],
    data: paths["/api/v1/journeys/{journeyId}"]["put"]["requestBody"]["content"]["application/json"],
  ) {
    return formatQueryResult(
      this.client.PUT("/api/v1/journeys/{journeyId}", {
        params: {
          path: { journeyId },
        },
        body: data,
      }),
    );
  }

  /**
   * RUNS
   */

  async getUserRunId(
    runId: paths["/api/v1/executor/runs/self/{runId}"]["get"]["parameters"]["path"]["runId"],
  ) {
    return formatQueryResult(
      this.client.GET("/api/v1/executor/runs/self/{runId}", {
        params: {
          path: {
            runId,
          },
        },
      }),
    );
  }

  async getUserRuns() {
    return formatQueryResult(this.client.GET("/api/v1/executor/runs/self", {}));
  }
}
