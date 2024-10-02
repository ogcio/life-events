import { FastifyInstance } from "fastify";
import files from "./files/index.js";
import metadata from "./metadata/index.js";
import permissions from "./metadata/permissions/index.js";
import schedulerCallback from "./schedulerCallback.js";

export default async function routes(app: FastifyInstance) {
  app.register(files, { prefix: "/files" });
  app.register(metadata, { prefix: "/metadata" });
  app.register(permissions, { prefix: "/permissions" });
  app.register(schedulerCallback, { prefix: "/jobs" });
}
