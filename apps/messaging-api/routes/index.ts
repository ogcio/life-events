import { FastifyInstance } from "fastify";

import messages from "./messages";
import emails from "./providers/emails";
import sms from "./providers/sms";
import templates from "./templates";

export default async function routes(app: FastifyInstance) {
  app.register(messages, { prefix: "/messages" });
  app.register(emails, { prefix: "/providers/emails" });
  app.register(sms, { prefix: "/providers/sms" });
  app.register(templates, { prefix: "/templates" });
}

export interface SMSService {
  Send: (message: string, E164number: string) => Promise<void>;
}
