// authPlugin.ts
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { getSessionData } from "auth/sessions";

interface User {
  id: string;
}

declare module "fastify" {
  interface FastifyRequest {
    user?: User;
  }
}

// Very secure, isn't it?
const sessionAuthPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate(
    "verifyUserWithSessionId",
    async function (request: FastifyRequest, reply: FastifyReply) {
      const sessionId = request.headers["x-session-id"] as string | undefined;
      if (!sessionId) {
        reply.code(401).send({ message: "Unauthorized" });
        return;
      }

      //TODO: validate the session
      const sessionData = await getSessionData(sessionId);

      //request.user = { id: ... };
    },
  );
};

export default fp(sessionAuthPlugin, {
  name: "verifyUserWithSessionId",
});
