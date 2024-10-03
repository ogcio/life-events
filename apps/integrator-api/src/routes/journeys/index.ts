import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  CreateJourneyBody,
  CreateJourneyBodyDO,
  FullJourneyDO,
  GenericResponse,
  Id,
  JourneyPublicDetails,
  JourneyPublicDetailsDO,
  Journeys,
  ParamsWithJourneyId,
  UpdateJourneyBody,
  UpdateJourneyBodyDO,
} from "../schemas";
import { formatAPIResponse } from "../../utils/responseFormatter";
import { authPermissions } from "../../types/authPermissions";

const TAGS = ["Journeys"];

export default async function journeys(app: FastifyInstance) {
  app.get<{
    Reply: GenericResponse<Journeys> | Error;
  }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.JOURNEY_READ]),
      schema: {
        tags: TAGS,
        response: {
          200: GenericResponse(Journeys),
          401: HttpError,
        },
      },
    },
    async (request, reply) => {
      const organizationId = request.userData?.organizationId;

      if (!organizationId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const journeys = await app.journey.getJourneys(organizationId);

      reply.send(formatAPIResponse(journeys));
    },
  );

  app.get<{
    Reply: GenericResponse<FullJourneyDO> | Error;
    Params: ParamsWithJourneyId;
  }>(
    "/:journeyId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.JOURNEY_READ]),
      schema: {
        tags: TAGS,
        response: {
          200: GenericResponse(JourneyPublicDetails),
          401: HttpError,
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const { journeyId } = request.params;
      const organizationId = request.userData?.organizationId;

      if (!organizationId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const journeyDetails = await app.journey.getJourneyById(
        journeyId,
        organizationId,
      );

      reply.send(formatAPIResponse(journeyDetails));
    },
  );

  app.get<{
    Reply: GenericResponse<JourneyPublicDetailsDO> | Error;
    Params: ParamsWithJourneyId;
  }>(
    "/:journeyId/public-info",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.JOURNEY_PUBLIC_READ]),
      schema: {
        tags: TAGS,
        response: {
          200: GenericResponse(JourneyPublicDetails),
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const { journeyId } = request.params;

      const details = await app.journey.getJourneyPublicInfo(journeyId);

      reply.send(formatAPIResponse(details));
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
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.userData?.userId;

      if (!userId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const res = await app.journey.createJourney(request.body);

      reply.send(formatAPIResponse(res));
    },
  );

  app.patch<{
    Body: UpdateJourneyBodyDO;
    Reply: GenericResponse<Id> | Error;
    Params: ParamsWithJourneyId;
  }>(
    "/:journeyId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.JOURNEY_WRITE]),
      schema: {
        tags: TAGS,
        body: UpdateJourneyBody,
        response: {
          200: GenericResponse(Id),
          401: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const { journeyId } = request.params;

      const organizationId = request.userData?.organizationId;

      if (!organizationId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const res = await app.journey.activateJourney({
        journeyId,
        organizationId,
        ...request.body,
      });

      reply.send(formatAPIResponse(res));
    },
  );
}
