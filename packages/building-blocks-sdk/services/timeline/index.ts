import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./schema";

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
    const { error, data } = await this.client.GET("/api/v1/timeline/", {
      params: {
        query,
      },
    });

    return { error, data: data };
  }
}
