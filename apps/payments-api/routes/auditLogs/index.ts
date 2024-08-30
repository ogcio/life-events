import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import { AuditLogEvents, GenericResponse, PaginationParams } from "../schemas";
import {
  PAGINATION_LIMIT_DEFAULT,
  PAGINATION_OFFSET_DEFAULT,
  PaginationDetails,
} from "../../utils/pagination";
import { formatAPIResponse } from "../../utils/responseFormatter";
import { GenericResponse as GenericResponseType } from "../../types/genericResponse";
import { PaginationParams as PaginationParamsType } from "../../types/pagination";
import { authPermissions } from "../../types/authPermissions";
import { AuditLogEvent as AuditLogEventDO } from "../../plugins/auditLog/types";

const TAGS_AUDIT_LOGS = ["AuditLogs"];

export default async function auditLogs(app: FastifyInstance) {
  app.get<{
    Reply: GenericResponseType<AuditLogEventDO[]> | Error;
    Querystring: PaginationParamsType;
  }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.TRANSACTION_ALL]), // TODO: CHange this later
      schema: {
        tags: TAGS_AUDIT_LOGS,
        querystring: PaginationParams,
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
      } = request.query;

      if (!organizationId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const events = await app.auditLog.getEvents(organizationId, {
        offset,
        limit,
      });
      const totalCount =
        await app.citizen.getTransactionsTotalCount(organizationId);
      const url = request.url.split("?")[0];
      const paginationDetails: PaginationDetails = {
        offset,
        limit,
        totalCount,
        url: url,
      };

      reply.send(formatAPIResponse(events, paginationDetails));
    },
  );
}
