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

export class Scheduler {
  client: ReturnType<typeof createClient<paths>>;
  constructor(authToken: string) {
    const authMiddleware: Middleware = {
      async onRequest(req) {
        req.headers.set("Authorization", `Bearer ${authToken}`);
        return req;
      },
    };

    this.client = createClient<paths>({
      baseUrl: process.env.PROFILE_BACKEND_URL,
    });
    this.client.use(authMiddleware);
  }
}