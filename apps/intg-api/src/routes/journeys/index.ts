import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  CreateJourneyBody,
  FullJourney,
  FullJourneyDO,
  GenericResponse,
  Id,
  JourneyPublicDetails,
  Journeys,
  JourneySchema,
  JourneyStepSchema,
  ParamsWithJourneyId,
  UpdateJourneyBody,
  UpdateJourneyBodyDO,
} from "../schemas";
import { formatAPIResponse } from "../../utils/responseFormatter";
import { authPermissions } from "../../types/authPermissions";
import {
  CreateJourneyBodyDO,
  JourneyPublicDetailsDO,
} from "../../plugins/entities/journey/types";
import { getExternalService } from "../../services/externalServices/externalServiceProvider";
import { getProfileSdk } from "../../utils/authenticationFactory";

const TAGS = ["Journeys"];

export default async function journeys(app: FastifyInstance) {
  app.get<{
    Reply: GenericResponse<JourneyPublicDetailsDO[]> | Error;
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
      const profileSdk = await getProfileSdk(organizationId);

      const promises = journeys.map(async (journey) => {
        const userInfo = await profileSdk.getUser(journey.userId);
        return {
          ...journey,
          userName: `${userInfo.data?.firstName} ${userInfo.data?.lastName}`,
        };
      });
      const result = await Promise.all(promises);

      reply.send(formatAPIResponse(result));
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
          200: GenericResponse(FullJourney),
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

      const steps = await app.journeySteps.getJourneySteps(journeyId);
      const connections =
        await app.journeyStepConnections.getJourneyStepConnections(journeyId);

      const fullJourney = {
        ...journeyDetails,
        steps,
        connections,
      };

      reply.send(formatAPIResponse(fullJourney));
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

  app.put<{
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

  app.get<{
    Reply: GenericResponse<JourneySchema> | Error;
    Params: ParamsWithJourneyId;
  }>(
    "/:journeyId/schema",
    {
      schema: {
        tags: TAGS,
        response: {
          200: GenericResponse(JourneySchema),
          401: HttpError,
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const { journeyId } = request.params;

      const journeyDetails = await app.journey.getJourneyPublicInfo(journeyId);

      const steps = await app.journeySteps.getJourneySteps(journeyId);

      const stepsData = steps.map((step) => {
        return new Promise<JourneyStepSchema>((resolve) => {
          try {
            const service = getExternalService(step.stepType);

            const result = {
              stepId: step.id,
              type: step.stepType,
              resourceId: "",
              stepSchema: undefined,
            } as JourneyStepSchema;

            const resourceId = service.getStepResourceId(step);

            if (!resourceId) {
              resolve(result);
              return;
            }

            result.resourceId = resourceId;

            service
              .getSchema(resourceId)
              .then((schema) => {
                result.stepSchema = schema;
                resolve(result);
              })
              .catch(() => {
                resolve(result);
              });
          } catch (err) {
            app.log.error(err);

            resolve({
              stepId: step.id,
              type: step.stepType,
              resourceId: "",
              stepSchema: undefined,
            } as JourneyStepSchema);
          }
        });
      });
      const stepDataResult = await Promise.all(stepsData);

      const connections =
        await app.journeyStepConnections.getJourneyStepConnections(journeyId);

      const result = {
        journeyId: journeyDetails.id,
        jounrneyTitle: journeyDetails.title,
        steps: stepDataResult,
        stepConnections: connections,
      };

      reply.send(formatAPIResponse(result));
    },
  );
}
