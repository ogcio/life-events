import { FastifyInstance } from "fastify";
import auth from "./auth/index.js";
import healthCheck from "./healthcheck.js";
import users from "./users/index.js";
import session from "./session/index.js";

export default async function routes(app: FastifyInstance) {
  app.register(healthCheck);
  app.register(auth, { prefix: "/auth" });
  app.register(users, { prefix: "/users" });
  app.register(session, { prefix: "/session" });
}
