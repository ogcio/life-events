import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  CreateJourneyBody,
  CreateJourneyBodyDO,
  GenericResponse,
  Id,
  JourneyDetails,
  JourneyDetailsDO,
  ParamsWithJourneyId,
} from "../schemas";
import { formatAPIResponse } from "../../utils/responseFormatter";
import { authPermissions } from "../../types/authPermissions";

const TAGS = ["Journeys"];

export default async function journeys(app: FastifyInstance) {
  app.get<{
    Reply: GenericResponse<JourneyDetailsDO> | Error;
    Params: ParamsWithJourneyId;
  }>(
    "/:journeyId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.JOURNEY_READ]),
      schema: {
        tags: TAGS,
        response: {
          200: GenericResponse(JourneyDetails),
          401: HttpError,
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const { journeyId } = request.params;
      const journeyDetails = await app.journey.getJourneyById(journeyId);

      reply.send(formatAPIResponse(journeyDetails));
    },
  );

  app.post<{
    Body: CreateJourneyBodyDO;
    Reply: GenericResponse<Id> | Error;
  }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.JOURNEY_WRITE]),
      schema: {
        tags: TAGS,
        body: CreateJourneyBody,
        response: {
          200: GenericResponse(Id),
          401: HttpError,
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.userData?.userId;

      if (!userId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const { id } = await app.journey.createJourney(request.body);

      reply.send(formatAPIResponse({ id }));
    },
  );
}
