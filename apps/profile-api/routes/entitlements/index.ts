import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import { EntitlementsList } from "../../types/schemaDefinitions";

export default async function entitlements(app: FastifyInstance) {
  app.get<{ Reply: EntitlementsList }>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Entitlements"],
        response: {
          200: EntitlementsList,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;

      try {
        const result = await app.pg.query(
          `SELECT type, issue_date, expiry_date, document_number, firstname, lastname FROM user_entitlements WHERE user_id = $1`,
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
            issue_date: "15/11/2022",
            expiry_date: "15/11/2032",
            document_number: "MURPH0523",
          },
          {
            firstname: "Name",
            lastname: "Surname",
            type: "birthCertificate",
            issue_date: "02/01/1990",
            document_number: "0523789",
          },
        ];
      } catch (error) {
        throw app.httpErrors.internalServerError((error as Error).message);
      }
    },
  );
}
