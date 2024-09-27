import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  GenericResponse,
  JourneyDetails,
  JourneyDetailsDO,
  ParamsWithJourneyId,
} from "../schemas";
import { formatAPIResponse } from "../../utils/responseFormatter";

const TAGS = ["Journeys"];

export default async function journeys(app: FastifyInstance) {
  app.get<{
    Reply: GenericResponse<JourneyDetailsDO> | Error;
    Params: ParamsWithJourneyId;
  }>(
    "/:journeyId",
    {
      // TODO: add prevalidation
      schema: {
        tags: TAGS,
        response: {
          200: GenericResponse(JourneyDetails),
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const organizationId = request.userData?.organizationId;
      const { journeyId } = request.params;

      const journeyDetails = await app.journeys.getJourneyById(
        journeyId,
        undefined,
        organizationId,
      );

      reply.send(formatAPIResponse(journeyDetails));
    },
  );
}
