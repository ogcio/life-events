import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  GenericResponse,
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
    "/journeys/:journeyId",
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

      const journeyDetails = await app.citizen.getJourneyById(journeyId);

      reply.send(formatAPIResponse(journeyDetails));
    },
  );
}
