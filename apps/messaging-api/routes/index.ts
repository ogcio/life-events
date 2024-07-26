import { FastifyInstance } from "fastify";

import messages from "./messages";
import emails from "./providers/emails";
import sms from "./providers/sms";
import templates from "./templates";
import organisationSettings from "./organisation-settings";
import userImports from "./user-imports";
import users from "./users";
import events, { prefix as eventsPrefix } from "./messages/events";

export default async function routes(app: FastifyInstance) {
  app.register(messages, { prefix: "/messages" });
  app.register(emails, { prefix: "/providers/emails" });
  app.register(sms, { prefix: "/providers/sms" });
  app.register(templates, { prefix: "/templates" });
  app.register(organisationSettings, { prefix: "/organisation-settings" });
  app.register(userImports, { prefix: "/user-imports" });
  app.register(users, { prefix: "/users" });
  app.register(events, { prefix: eventsPrefix });
}

export interface SMSService {
  // eslint-disable-next-line no-unused-vars
  Send: (message: string, E164number: string) => Promise<void>;
}
