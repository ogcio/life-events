import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./schema";

export class Payments {
  client: ReturnType<typeof createClient<paths>>;
  constructor(authToken: string) {
    const authMiddleware: Middleware = {
      async onRequest(req) {
        req.headers.set("Authorization", `Bearer ${authToken}`);
        return req;
      },
    };

    this.client = createClient<paths>({
      baseUrl: process.env.PAYMENTS_BACKEND_URL,
    });
    this.client.use(authMiddleware);
  }

  async getProviders() {
    return this.client.GET("/api/v1/providers/");
  }
}
