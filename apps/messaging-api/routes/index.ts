import { FastifyInstance } from "fastify";

import messages from "./messages";
import providers, { prefix as providersPrefix } from "./providers";
import templates from "./templates";
import organisationSettings from "./organisation-settings";
import userImports from "./user-imports";
import users from "./users";
import events, { prefix as eventsPrefix } from "./messages/events";
import jobs, { prefix as jobsPrefix } from "./jobs";

export default async function routes(app: FastifyInstance) {
  app.register(messages, { prefix: "/messages" });
  app.register(providers, { prefix: providersPrefix });
  app.register(templates, { prefix: "/templates" });
  app.register(organisationSettings, { prefix: "/organisation-settings" });
  app.register(userImports, { prefix: "/user-imports" });
  app.register(users, { prefix: "/users" });
  app.register(events, { prefix: eventsPrefix });
  app.register(jobs, { prefix: jobsPrefix });
}

export interface SMSService {
  // eslint-disable-next-line no-unused-vars
  Send: (message: string, E164number: string) => Promise<void>;
}
