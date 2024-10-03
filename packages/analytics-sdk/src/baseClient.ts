import createClient, { Client, type Middleware } from "openapi-fetch";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class BaseClient<T extends Record<string, any>> {
  protected client: Client<T>;

  constructor(baseUrl: string) {
    this.client = createClient<T>({ baseUrl });
  }

  setAuthToken(token: string) {
    const authMiddleware: Middleware = {
      async onRequest({ request }) {
        request.headers.set("Authorization", `Bearer ${token}`);
        return request;
      },
    };
    this.client.use(authMiddleware);
  }
}
