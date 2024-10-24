import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  EntitlementsList,
  EntitlementsListSchema,
} from "../../types/schemaDefinitions";
import { getErrorMessage } from "@ogcio/shared-errors";
import { Permissions } from "../../types/permissions";

const ENTITLEMENTS_TAGS = ["Entitlements"];

export default async function entitlements(app: FastifyInstance) {
  app.get<{ Reply: EntitlementsList }>(
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
          200: EntitlementsListSchema,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.userData?.userId;

      try {
        const result = await app.pg.query(
          `SELECT type, issue_date AS "issueDate", 
            expiry_date AS "expiryDate", 
            document_number AS "documentNumber", 
            firstname, lastname FROM user_entitlements WHERE user_id = $1`,
          [userId],
        );

        if (result.rows.length > 0) {
          return reply.send(result.rows);
        }

        /** NOTE: the defaults below are for demo purposes only given we cannot load any real user entitlements at the moment */
        return [
          {
            firstname: "Name",
            lastname: "Surname",
            type: "drivingLicence",
            issueDate: "15/11/2022",
            expiryDate: "15/11/2032",
            documentNumber: "MURPH0523",
          },
          {
            firstname: "Name",
            lastname: "Surname",
            type: "birthCertificate",
            issueDate: "02/01/1990",
            documentNumber: "0523789",
          },
        ];
      } catch (error) {
        throw app.httpErrors.internalServerError(getErrorMessage(error));
      }
    },
  );
}
