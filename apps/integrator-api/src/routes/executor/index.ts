import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  FullRun,
  FullRunDO,
  GenericResponse,
  ParamsWithRunIdDO,
  Runs,
} from "../schemas";
import { formatAPIResponse } from "../../utils/responseFormatter";
import { authPermissions } from "../../types/authPermissions";
import { RunDetailsDO } from "../../plugins/entities/run/types";

const TAGS = ["Executor"];

export default async function executor(app: FastifyInstance) {
  app.get<{
    Reply: GenericResponse<RunDetailsDO[]> | Error;
  }>(
    "/runs",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.RUN_SELF_READ]),
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

      const runs = await app.run.getUserRuns(userId);

      reply.send(formatAPIResponse(runs));
    },
  );

  app.get<{
    Reply: GenericResponse<FullRunDO> | Error;
    Params: ParamsWithRunIdDO;
  }>(
    "/:runId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.RUN_SELF_READ]),
      schema: {
        tags: TAGS,
        response: {
          200: GenericResponse(FullRun),
          401: HttpError,
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const { runId } = request.params;
      const userId = request.userData?.userId;

      if (!userId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const runDetails = await app.run.getUserRunById(runId, userId);

      const steps = await app.run.getRunStepsByRunId(runId);

      // TODO: call steps apis to retrieve steps
      const fullRun = {
        ...runDetails,
        steps,
      };

      reply.send(formatAPIResponse(fullRun));
    },
  );
}
