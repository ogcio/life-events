import providers from "./providers";
import { FastifyInstance } from "fastify";

export default async function routes(app: FastifyInstance) {
  app.register(providers, { prefix: "/providers" });
}
