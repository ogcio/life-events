import { FastifyInstance } from "fastify";
import addresses from "./addresses";
import entitlements from "./entitlements";
import userDetails from "./user";

export default async function routes(app: FastifyInstance) {
  app.register(addresses, { prefix: "/addresses" });
  app.register(entitlements, { prefix: "/entitlements" });
  app.register(userDetails, { prefix: "/user" });
}
