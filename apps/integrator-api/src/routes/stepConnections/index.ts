import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  CreateJourneyStepConnection,
  EmptyBody,
  GenericResponse,
  JourneyStepConnection,
} from "../schemas";
import { formatAPIResponse } from "../../utils/responseFormatter";
import { authPermissions } from "../../types/authPermissions";
import {
  CreateJourneyStepConnectionDO,
  JourneyStepConnectionDO,
  ParamsWithJourneyStepConnectionIdDO,
} from "../../plugins/entities/journeyStepConnections/types";

const TAGS = ["StepConnections"];

export default async function stepConnections(app: FastifyInstance) {
  app.get<{
    Reply: GenericResponse<JourneyStepConnectionDO> | Error;
    Params: ParamsWithJourneyStepConnectionIdDO;
  }>(
    "/:connectionId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.JOURNEY_READ]),
      schema: {
        tags: TAGS,
        response: {
          200: GenericResponse(JourneyStepConnection),
          401: HttpError,
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const { connectionId } = request.params;

      const connection =
        await app.journeyStepConnections.getConnectionById(connectionId);

      reply.send(formatAPIResponse(connection));
    },
  );

  app.post<{
    Reply: GenericResponse<JourneyStepConnectionDO> | Error;
    Body: CreateJourneyStepConnectionDO;
  }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.JOURNEY_READ]),
      schema: {
        tags: TAGS,
        body: CreateJourneyStepConnection,
        response: {
          201: GenericResponse(JourneyStepConnection),
          401: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const connection = await app.journeyStepConnections.createConnection(
        request.body,
      );

      reply.code(201);
      reply.send(formatAPIResponse(connection));
    },
  );

  app.delete<{
    Reply: GenericResponse<boolean> | Error;
    Params: ParamsWithJourneyStepConnectionIdDO;
  }>(
    "/:connectionId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.JOURNEY_READ]),
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
      const { connectionId } = request.params;

      await app.journeyStepConnections.deleteConnection(connectionId);

      reply.code(204);
      reply.send();
    },
  );
}
