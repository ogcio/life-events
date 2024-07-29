import createClient, { FetchResponse, type Middleware } from "openapi-fetch";
import type { paths } from "./schema";

export class Upload {
  client: ReturnType<typeof createClient<paths>>;
  constructor(authToken: string) {
    const authMiddleware: Middleware = {
      async onRequest(req) {
        req.headers.set("Authorization", `Bearer ${authToken}`);
        return req;
      },
    };

    this.client = createClient<paths>({
      baseUrl: process.env.UPLOAD_BACKEND_URL,
    });
    this.client.use(authMiddleware);
  }

  async getFiles() {
    const { error, data } = await this.client.GET("/api/v1/files/");
    return { error, data: data?.data };
  }
}
