import { FastifyInstance } from "fastify";

import messages from "./messages";
import emails from "./providers/emails";
import sms from "./providers/sms";
import templates from "./templates";
import users from "./users";
import usersImports from "./users/imports";

export default async function routes(app: FastifyInstance) {
  app.register(messages, { prefix: "/messages" });
  app.register(emails, { prefix: "/providers/emails" });
  app.register(sms, { prefix: "/providers/sms" });
  app.register(templates, { prefix: "/templates" });
  app.register(users, { prefix: "/users" });
  app.register(usersImports, { prefix: "/users/imports" });
}

export interface SMSService {
  // eslint-disable-next-line no-unused-vars
  Send: (message: string, E164number: string) => Promise<void>;
}
