import paymentRequests from "./paymentRequests";
import providers from "./providers";
import { FastifyInstance } from "fastify";
import transactions from "./transactions";
import citizen from "./citizen";
import realex from "./realex";

export default async function routes(app: FastifyInstance) {
  app.register(providers, { prefix: "/providers" });
  app.register(paymentRequests, { prefix: "/requests" });
  app.register(transactions, { prefix: "/transactions" });
  app.register(citizen, { prefix: "/citizen" });
  app.register(realex, { prefix: "/realex" });
}
