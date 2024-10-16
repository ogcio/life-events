import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  UserFullRun,
  UserFullRunDO,
  GenericResponse,
  ParamsWithJourneyId,
  ParamsWithRunIdDO,
  UserRuns,
  PublicServantRuns,
  PublicServantFullRunDO,
  PublicServantFullRun,
  Id,
  CreateJourneyRun,
} from "../schemas";
import { formatAPIResponse } from "../../utils/responseFormatter";
import { authPermissions } from "../../types/authPermissions";
import {
  UserRunDetailsDO,
  PSRunDetailsDO,
} from "../../plugins/entities/run/types";

const TAGS = ["Executor"];

export default async function executor(app: FastifyInstance) {
  app.get<{
    Reply: GenericResponse<UserRunDetailsDO[]> | Error;
  }>(
    "/runs/self",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.RUN_SELF_READ]),
      schema: {
        tags: TAGS,
        response: {
          200: GenericResponse(UserRuns),
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
    Reply: GenericResponse<UserFullRunDO> | Error;
    Params: ParamsWithRunIdDO;
  }>(
    "/runs/self/:runId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.RUN_SELF_READ]),
      schema: {
        tags: TAGS,
        response: {
          200: GenericResponse(UserFullRun),
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

      const [runDetails, steps] = await Promise.all([
        app.run.getUserRunById(runId, userId),
        app.run.getRunStepsByRunId(runId),
      ]);

      const fullRun = {
        ...runDetails,
        steps,
      };

      reply.send(formatAPIResponse(fullRun));
    },
  );

  app.get<{
    Reply: GenericResponse<PSRunDetailsDO[]> | Error;
    Params: ParamsWithJourneyId;
  }>(
    "/runs/journeys/:journeyId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.RUN_READ]),
      schema: {
        tags: TAGS,
        response: {
          200: GenericResponse(PublicServantRuns),
          401: HttpError,
        },
      },
    },
    async (request, reply) => {
      const { journeyId } = request.params;
      const organizationId = request.userData?.organizationId;

      if (!organizationId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const runs = await app.run.getRunsByJourneyId(journeyId, organizationId);

      reply.send(formatAPIResponse(runs));
    },
  );

  app.get<{
    Reply: GenericResponse<PublicServantFullRunDO> | Error;
    Params: ParamsWithRunIdDO;
  }>(
    "/runs/:runId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.RUN_READ]),
      schema: {
        tags: TAGS,
        response: {
          200: GenericResponse(PublicServantFullRun),
          401: HttpError,
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const { runId } = request.params;
      const organizationId = request.userData?.organizationId;

      if (!organizationId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const [runDetails, steps] = await Promise.all([
        app.run.getRunById(runId, organizationId),
        app.run.getRunStepsByRunId(runId),
      ]);

      const fullRun = {
        ...runDetails,
        steps,
      };

      reply.send(formatAPIResponse(fullRun));
    },
  );

  // RUN
  app.post<{
    Reply: GenericResponse<Id> | Error;
    Body: CreateJourneyRun;
  }>(
    "/run",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.RUN_WRITE]),
      schema: {
        tags: TAGS,
        body: CreateJourneyRun,
        response: {
          200: GenericResponse(Id),
          401: HttpError,
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const { journeyId } = request.body;
      const userId = request.userData?.userId;

      if (!userId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const journeyInfo = await app.journey.getJourneyById(journeyId);
      const runId = await app.run.createRun(journeyId, userId);
      await app.run.createRunStep(runId.id, journeyInfo.initialStepId);

      reply.send(formatAPIResponse(runId));
    },
  );
}
