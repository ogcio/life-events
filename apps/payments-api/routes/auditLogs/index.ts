import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  AuditLogEventDetails,
  AuditLogEvents,
  AuditLogEventsFiltersQueryString,
  EventTypes,
  GenericResponse,
  ParamsWithAuditLogId,
} from "../schemas";
import {
  PAGINATION_LIMIT_DEFAULT,
  PAGINATION_OFFSET_DEFAULT,
  PaginationDetails,
} from "../../utils/pagination";
import { formatAPIResponse } from "../../utils/responseFormatter";
import { GenericResponse as GenericResponseType } from "../../types/genericResponse";
import { authPermissions } from "../../types/authPermissions";
import {
  AuditLogEventDetailsDO,
  AuditLogEvent as AuditLogEventDO,
  AuditLogEventsFilters,
} from "../../plugins/auditLog/types";
import { getProfileSdk } from "../../utils/authenticationFactory";
import { findUser } from "../../services/findUser";

const TAGS_AUDIT_LOGS = ["AuditLogs"];

export default async function auditLogs(app: FastifyInstance) {
  app.get<{
    Reply: GenericResponseType<AuditLogEventDO[]> | Error;
    Querystring: AuditLogEventsFiltersQueryString;
  }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.TRANSACTION_ALL]), // TODO: CHange this later
      schema: {
        tags: TAGS_AUDIT_LOGS,
        querystring: AuditLogEventsFiltersQueryString,
        response: {
          200: GenericResponse(AuditLogEvents),
          401: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const organizationId = request.userData?.organizationId;
      const {
        offset = PAGINATION_OFFSET_DEFAULT,
        limit = PAGINATION_LIMIT_DEFAULT,
        resource,
        action,
        user,
        from,
        to,
      } = request.query;

      if (!organizationId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const url = request.url.split("?")[0];

      const filters: AuditLogEventsFilters = {
        eventType: undefined,
        userId: undefined,
        from,
        to,
      };

      filters.eventType = `${resource ?? "%"}.${action ?? "%"}`;

      if (user) {
        const userDetails = await findUser(user, organizationId);

        if (!userDetails) {
          // User was not found, empty result will be returned
          reply.send(
            formatAPIResponse([], {
              offset,
              limit,
              totalCount: 0,
              url: url,
            }),
          );
          return;
        }

        filters.userId = userDetails.id;
      }

      const events = await app.auditLog.getEvents(organizationId, filters, {
        offset,
        limit,
      });

      const totalCount = await app.auditLog.getEventsTotalCount(
        organizationId,
        filters,
      );

      const paginationDetails: PaginationDetails = {
        offset,
        limit,
        totalCount,
        url: url,
      };

      reply.send(formatAPIResponse(events, paginationDetails));
    },
  );

  app.get<{
    Reply: GenericResponseType<Record<string, string>> | Error;
  }>(
    "/event-types",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.TRANSACTION_ALL]), // TODO: CHange this later
      schema: {
        tags: TAGS_AUDIT_LOGS,
        response: {
          200: GenericResponse(EventTypes),
          401: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const organizationId = request.userData?.organizationId;

      if (!organizationId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const eventTypes = await app.auditLog.getEventTypes();

      reply.send(formatAPIResponse(eventTypes));
    },
  );

  app.get<{
    Reply: GenericResponseType<AuditLogEventDetailsDO> | Error;
    Params: ParamsWithAuditLogId;
  }>(
    "/:auditLogId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.TRANSACTION_ALL]), // TODO: Change this later
      schema: {
        tags: TAGS_AUDIT_LOGS,
        response: {
          200: GenericResponse(AuditLogEventDetails),
          401: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const organizationId = request.userData?.organizationId;
      const { auditLogId } = request.params;

      if (!organizationId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const eventDetails = await app.auditLog.getEventById(
        auditLogId,
        organizationId,
      );

      reply.send(formatAPIResponse(eventDetails));
    },
  );
}
