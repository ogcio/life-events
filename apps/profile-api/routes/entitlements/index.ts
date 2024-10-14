import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  Entitlement,
  EntitlementsList,
  EntitlementsListSchema,
  GenericResponse,
  getGenericResponseSchema,
} from "../../types/schemaDefinitions";
import { formatAPIListResponse } from "../../types/pagination";
import { getErrorMessage } from "@ogcio/shared-errors";
import { Permissions } from "../../types/permissions";

const ENTITLEMENTS_TAGS = ["Entitlements"];

export default async function entitlements(app: FastifyInstance) {
  app.get<{ Reply: GenericResponse<EntitlementsList> }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(
          req,
          res,
          [Permissions.Entitlement.Read, Permissions.EntitlementSelf.Read],
          { method: "OR" },
        ),
      schema: {
        tags: ENTITLEMENTS_TAGS,
        response: {
          200: getGenericResponseSchema(EntitlementsListSchema),
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.userData?.userId;

      try {
        const result = await app.pg.query<Entitlement>(
          `SELECT type, issue_date AS "issueDate", 
            expiry_date AS "expiryDate", 
            document_number AS "documentNumber", 
            firstname, lastname FROM user_entitlements WHERE user_id = $1`,
          [userId],
        );

        return reply.send(
          formatAPIListResponse({
            data: result.rows,
            request,
            totalCount: result.rowCount ?? 0,
          }),
        );
      } catch (error) {
        throw app.httpErrors.internalServerError(getErrorMessage(error));
      }
    },
  );
}
