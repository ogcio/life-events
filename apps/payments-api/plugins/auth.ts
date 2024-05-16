// authPlugin.ts
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

// Very secure, isn't it?
const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate(
    "verifyUser",
    async function (request: FastifyRequest, reply: FastifyReply) {
      const userId = request.headers["x-user-id"] as string | undefined;
      if (!userId) {
        reply.code(401).send({ message: "Unauthorized" });
        return;
      }
      request.user = { id: userId };
    },
  );
};

export default fp(authPlugin, {
  name: "authPlugin",
});
