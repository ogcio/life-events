import paymentRequests from "./paymentRequests";
import providers from "./providers";
import { FastifyInstance } from "fastify";

export default async function routes(app: FastifyInstance) {
  app.register(providers, { prefix: "/providers" });
  app.register(paymentRequests, { prefix: "/requests" });
}
