import { FastifyInstance } from "fastify";

import messages from "./messages";
import emails from "./providers/emails";
import templates from "./templates";

export default async function routes(app: FastifyInstance) {
  app.register(messages, { prefix: "/messages" });
  app.register(emails, { prefix: "/providers/emails" });
  app.register(templates, { prefix: "/templates" });
}
