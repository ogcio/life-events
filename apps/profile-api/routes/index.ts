import { FastifyInstance } from "fastify";
import addresses from "./addresses";
import entitlements from "./entitlements";
import users from "./users";

export default async function routes(app: FastifyInstance) {
  app.register(addresses, { prefix: "/addresses" });
  app.register(entitlements, { prefix: "/entitlements" });
  app.register(users, { prefix: "/users" });
}
