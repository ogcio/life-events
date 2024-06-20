// authPlugin.ts
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { AuthenticationError } from "shared-errors";

export interface RequestUser {
  id: string;
  organisation_id?: string;
}

declare module "fastify" {
  interface FastifyRequest {
    user?: RequestUser;
  }
}

// Very secure, isn't it?
const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate(
    "verifyUser",
    async function (request: FastifyRequest, _reply: FastifyReply) {
      const userId = request.headers["x-user-id"] as string | undefined;
      if (!userId) {
        throw new AuthenticationError("VERIFY_USER");
      }
      request.user = { id: userId };
    },
  );
};

export default fp(authPlugin, {
  name: "authPlugin",
});
