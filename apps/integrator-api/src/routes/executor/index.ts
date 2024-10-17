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
  ExecuteJourneyStep,
  JourneyStepExecutionResponse,
  TransitionJourneyStep,
} from "../schemas";
import { formatAPIResponse } from "../../utils/responseFormatter";
import { authPermissions } from "../../types/authPermissions";
import {
  UserRunDetailsDO,
  PSRunDetailsDO,
  RunStatusEnum,
  RunStepStatusEnum,
} from "../../plugins/entities/run/types";
import IntegratorEngine from "../../libraries/integratorEngine";

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
        app.checkPermissions(req, res, [authPermissions.RUN_SELF_WRITE]),
      schema: {
        tags: TAGS,
        body: CreateJourneyRun,
        response: {
          200: GenericResponse(Id),
          401: HttpError,
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const { journeyId } = request.body;
      const userId = request.userData?.userId;

      if (!userId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const journeyInfo = await app.journey.getJourneyPublicInfo(journeyId);
      const runId = await app.run.createRun(journeyId, userId);
      await app.run.createRunStep(runId.id, journeyInfo.initialStepId);

      reply.send(formatAPIResponse(runId));
    },
  );

  app.post<{
    Reply: GenericResponse<JourneyStepExecutionResponse> | Error;
    Body: ExecuteJourneyStep;
  }>(
    "/execute",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.RUN_SELF_WRITE]),
      schema: {
        tags: TAGS,
        body: ExecuteJourneyStep,
        response: {
          200: GenericResponse(JourneyStepExecutionResponse),
          401: HttpError,
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const { journeyId, runId } = request.body;
      const userId = request.userData?.userId;

      if (!userId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const run = await app.run.getUserRunById(runId, userId);

      if (run.status === RunStatusEnum.COMPLETED) {
        reply.send(
          formatAPIResponse({
            url: new URL(
              `/journey/${journeyId}/complete`,
              process.env.INTEGRATOR_URL,
            ).href,
          }),
        );
        return;
      }

      const activeRunStep = await app.run.getActiveRunStep(runId);

      if (!activeRunStep) {
        throw app.httpErrors.internalServerError("No active step found");
      }

      const step = await app.journeySteps.getStepById(activeRunStep.stepId);
      const engine = new IntegratorEngine(step.stepType);
      const result = await engine.executeStep(step.stepData);

      await app.run.updateRunStep(activeRunStep.id, {
        data: activeRunStep.data,
        status: RunStepStatusEnum.IN_PROGRESS,
      });

      reply.send(formatAPIResponse(result));
    },
  );

  app.post<{
    Reply: GenericResponse<JourneyStepExecutionResponse> | Error;
    Body: TransitionJourneyStep;
  }>(
    "/transition",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.RUN_SELF_WRITE]),
      schema: {
        tags: TAGS,
        body: TransitionJourneyStep,
        response: {
          200: GenericResponse(JourneyStepExecutionResponse),
          401: HttpError,
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const { journeyId, runId, data } = request.body;
      const userId = request.userData?.userId;

      if (!userId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const run = await app.run.getUserRunById(runId, userId);

      if (run.status === RunStatusEnum.COMPLETED) {
        reply.send(
          formatAPIResponse({
            url: new URL(
              `/journey/${journeyId}/complete`,
              process.env.INTEGRATOR_URL,
            ).href,
          }),
        );
        return;
      }

      const activeRunStep = await app.run.getActiveRunStep(runId);

      if (!activeRunStep) {
        throw app.httpErrors.internalServerError("No active step found");
      }

      await app.run.updateRunStep(activeRunStep.id, {
        data,
        status: RunStepStatusEnum.COMPLETED,
      });

      const step = await app.journeySteps.getStepById(activeRunStep.stepId);
      const engine = new IntegratorEngine(step.stepType);

      const stepConnections =
        await app.journeyStepConnections.getJourneyStepConnections(journeyId);
      const nextStepId = engine.getNextStep(step.id, stepConnections);

      if (!nextStepId) {
        await app.run.updateRun(runId, RunStatusEnum.COMPLETED);

        reply.send(
          formatAPIResponse({
            url: new URL(
              `/journey/${journeyId}/complete`,
              process.env.INTEGRATOR_URL,
            ).href,
          }),
        );
        return;
      }

      await app.run.createRunStep(runId, nextStepId);

      reply.send(
        formatAPIResponse({
          url: new URL(
            `/journey/${journeyId}/run/${runId}`,
            process.env.INTEGRATOR_URL,
          ).href,
        }),
      );
    },
  );
}
