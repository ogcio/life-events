import paymentRequests from "./paymentRequests";
import providers from "./providers";
import { FastifyInstance } from "fastify";
import transactions from "./transactions";
import citizen from "./citizen";
import realex from "./realex";
import authTest from "./authTest";
import auditLogs from "./auditLogs";
import redirectToken from "./redirectToken/index";

export default async function routes(app: FastifyInstance) {
  app.register(providers, { prefix: "/providers" });
  app.register(paymentRequests, { prefix: "/requests" });
  app.register(transactions, { prefix: "/transactions" });
  app.register(citizen, { prefix: "/citizen" });
  app.register(realex, { prefix: "/realex" });
  app.register(redirectToken, { prefix: "/redirectToken" });

  // API for testing purposes on authorization
  app.register(authTest, { prefix: "/test" });

  app.register(auditLogs, { prefix: "/auditLogs" });
}
