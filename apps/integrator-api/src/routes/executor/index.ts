import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import { GenericResponse, Runs } from "../schemas";
import { formatAPIResponse } from "../../utils/responseFormatter";
import { authPermissions } from "../../types/authPermissions";
import { RunDO } from "../../plugins/entities/run/types";

const TAGS = ["Executor"];

export default async function executor(app: FastifyInstance) {
  app.get<{
    Reply: GenericResponse<RunDO[]> | Error;
  }>(
    "/runs",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.RUN_READ]),
      schema: {
        tags: TAGS,
        response: {
          200: GenericResponse(Runs),
          401: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.userData?.userId;

      if (!userId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const runs = await app.run.getRuns(userId);

      reply.send(formatAPIResponse(runs));
    },
  );
}
