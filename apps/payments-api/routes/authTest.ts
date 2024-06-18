import { FastifyInstance } from "fastify";
import { formatAPIResponse } from "../utils/responseFormatter";

const permissions = {
  citizen: {
    test: "payments:create:payment",
    testError: "fake_permission",
  },
  publicServant: {
    test: "payments:create:providers",
    testError: "fake_permission",
  },
};

export default async function transactions(app: FastifyInstance) {
  // Test API - You need to be recognized as a Citizen to use this API
  app.get(
    "/citizen",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [permissions.citizen.test]),
    },
    async (request, reply) => {
      reply.send(formatAPIResponse({ ok: true }));
    },
  );

  // Test API - You need to be recognized as a Public Servant to use this API
  app.get(
    "/pub-ser",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [permissions.publicServant.test]),
    },
    async (request, reply) => {
      reply.send(formatAPIResponse({ ok: true }));
    },
  );
}
