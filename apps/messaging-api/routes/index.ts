import { FastifyInstance } from "fastify";

import messages from "./messages";
import emails from "./providers/emails";
import sms from "./providers/sms";
import templates from "./templates";
import userSettings from "./users/settings";
import usersImports from "./users/imports";
import recipients from "./users/recipients";
import authTest from "./authTest";

export default async function routes(app: FastifyInstance) {
  app.register(messages, { prefix: "/messages" });
  app.register(emails, { prefix: "/providers/emails" });
  app.register(sms, { prefix: "/providers/sms" });
  app.register(templates, { prefix: "/templates" });
  app.register(userSettings, { prefix: "/users/settings" });
  app.register(usersImports, { prefix: "/users/imports" });
  app.register(recipients, { prefix: "/users/recipients" });

  // API for testing purposes on authorization
  app.register(authTest, { prefix: "/test" });
}

export interface SMSService {
  // eslint-disable-next-line no-unused-vars
  Send: (message: string, E164number: string) => Promise<void>;
}
