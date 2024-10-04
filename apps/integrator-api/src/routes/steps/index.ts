import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  CreateJourneyStep,
  EmptyBody,
  GenericResponse,
  JourneyStep,
  UpdateJourneyStep,
} from "../schemas";
import { formatAPIResponse } from "../../utils/responseFormatter";
import { authPermissions } from "../../types/authPermissions";
import {
  CreateJourneyStepDO,
  JourneyStepDO,
  ParamsWithJourneyStepIdDO,
} from "../../plugins/entities/journeySteps/types";

const TAGS = ["Steps"];

export default async function steps(app: FastifyInstance) {
  app.get<{
    Reply: GenericResponse<JourneyStepDO> | Error;
    Params: ParamsWithJourneyStepIdDO;
  }>(
    "/:stepId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.JOURNEY_STEP_READ]),
      schema: {
        tags: TAGS,
        response: {
          200: GenericResponse(JourneyStep),
          401: HttpError,
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const { stepId } = request.params;

      const step = await app.journeySteps.getStepById(stepId);

      reply.send(formatAPIResponse(step));
    },
  );

  app.post<{
    Reply: GenericResponse<JourneyStepDO> | Error;
    Body: CreateJourneyStepDO;
  }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.JOURNEY_STEP_WRITE]),
      schema: {
        tags: TAGS,
        body: CreateJourneyStep,
        response: {
          201: GenericResponse(JourneyStep),
          401: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const step = await app.journeySteps.createStep(request.body);

      reply.code(201);
      reply.send(formatAPIResponse(step));
    },
  );

  app.delete<{
    Reply: GenericResponse<boolean> | Error;
    Params: ParamsWithJourneyStepIdDO;
  }>(
    "/:stepId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.JOURNEY_STEP_WRITE]),
      schema: {
        tags: TAGS,
        response: {
          204: GenericResponse(EmptyBody),
          401: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const { stepId } = request.params;

      await app.journeySteps.deleteStep(stepId);

      reply.code(204);
      reply.send();
    },
  );

  app.put<{
    Reply: GenericResponse<JourneyStepDO> | Error;
    Body: CreateJourneyStepDO;
    Params: ParamsWithJourneyStepIdDO;
  }>(
    "/:stepId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.JOURNEY_STEP_WRITE]),
      schema: {
        tags: TAGS,
        body: UpdateJourneyStep,
        response: {
          200: GenericResponse(JourneyStep),
          401: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const { stepId } = request.params;
      const step = await app.journeySteps.updateStep(stepId, request.body);

      reply.send(formatAPIResponse(step));
    },
  );
}
