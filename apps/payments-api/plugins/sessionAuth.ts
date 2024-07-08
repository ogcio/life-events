import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

// TODO: THIS HAS TO BE REMOVED

interface User {
  id: string;
  publicServant?: boolean;
}

declare module "fastify" {
  interface FastifyRequest {
    user?: User;
  }
}

const sessionAuthPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate(
    "verifyUserWithSessionId",
    async function (request: FastifyRequest, reply: FastifyReply) {
      const sessionId = request.headers["x-session-id"] as string | undefined;
      if (!sessionId) {
        reply.code(401).send({ message: "Unauthorized" });
        return;
      }

      try {
        const response = await fetch(
          `${process.env.AUTH_SERVICE_URL}/session/validate?sessionId=${sessionId}`,
        );

        if (!response.ok) {
          reply.code(401).send({ message: "Unauthorized" });
          return;
        }

        const sessionData = await response.json();

        if (!sessionData || !sessionData.userId) {
          reply.code(401).send({ message: "Unauthorized" });
          return;
        }

        request.user = {
          id: sessionData.userId,
          publicServant: sessionData.publicServant,
        };
      } catch (err) {
        reply.code(500).send({ message: "Internal Server Error" });
      }
    },
  );

  fastify.decorate(
    "validateIsPublicServant",
    async function (request: FastifyRequest, reply: FastifyReply) {
      await fastify.verifyUserWithSessionId(request, reply);

      if (!request.user?.publicServant) {
        reply.code(403).send({ message: "You cannot access this API" });
      }
    },
  );
};

export default fp(sessionAuthPlugin, {
  name: "verifyUserWithSessionId",
});
