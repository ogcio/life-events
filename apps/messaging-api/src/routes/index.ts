import { FastifyInstance } from "fastify";

import messages, { prefix as messagePrefix } from "./messages/index.js";
import providers, { prefix as providersPrefix } from "./providers/index.js";
import templates from "./templates/index.js";
import organisationSettings from "./organisation-settings/index.js";
import userImports from "./user-imports/index.js";
import users from "./users/index.js";
import events, { prefix as eventsPrefix } from "./messages/events.js";
import jobs, { prefix as jobsPrefix } from "./jobs/index.js";

export default async function routes(app: FastifyInstance) {
  app.register(messages, { prefix: messagePrefix });
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
