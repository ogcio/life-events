import { FastifyInstance } from "fastify";
import { formatAPIResponse } from "../utils/pagination";

const permissions = {
  citizen: {
    test: "messaging:message.self:read",
    testError: "fake_permission",
  },
  publicServant: {
    test: "messaging:provider:create",
    testError: "fake_permission",
  },
};

export default async function authTests(app: FastifyInstance) {
  // Test API - You need to be recognized as a Citizen to use this API
  app.get(
    "/citizen",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [permissions.citizen.test]),
    },
    async (request, reply) => {
      app.log.info({ userData: request.userData });
      reply.send(formatAPIResponse([{ ok: true }]));
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
      app.log.info({ userData: request.userData });
      reply.send(formatAPIResponse([{ ok: true }]));
    },
  );
}
