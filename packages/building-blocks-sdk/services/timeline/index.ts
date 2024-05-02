import createClient, { FetchResponse, type Middleware } from "openapi-fetch";
import type { paths } from "./schema";

const formatQueryResult = async <T, O>(
  promise: Promise<FetchResponse<T, O>>,
) => {
  try {
    const result = await promise;
    return { data: result.data, error: result.error };
  } catch (error) {
    return { data: undefined, error };
  }
};

export class Timeline {
  private client: ReturnType<typeof createClient<paths>>;
  constructor(authToken: string) {
    const authMiddleware: Middleware = {
      async onRequest(req) {
        // Send temporarly the user id as auth token
        req.headers.set("x-user-id", authToken);

        // Once the logto integration is complete, we will send the real auth token
        //req.headers.set("Authorization", `Bearer ${authToken}`);
        return req;
      },
    };

    this.client = createClient<paths>({
      baseUrl: process.env.TIMELINE_BACKEND_URL,
    });
    this.client.use(authMiddleware);
  }

  async getTimelineData(
    query?: paths["/api/v1/timeline/"]["get"]["parameters"]["query"],
  ) {
    return formatQueryResult(
      this.client.GET("/api/v1/timeline/", {
        params: {
          query,
        },
      }),
    );
  }
}
