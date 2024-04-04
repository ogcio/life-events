import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./schema";
import { PgSessions } from "auth/sessions";

const authMiddleware: Middleware = {
  async onRequest(req) {
    const { userId } = await PgSessions.get();

    req.headers.set("Authorization", `Bearer ${userId}`);
    //To remove as soon as we have the real auth token in place
    req.headers.set("x-user-id", userId);
    return req;
  },
};

const client = createClient<paths>({ baseUrl: process.env.BACKEND_URL });
client.use(authMiddleware);

export default client;
