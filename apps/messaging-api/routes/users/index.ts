import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import { importCsvFromRequest } from "../../services/users/csv-import";
import { HttpError } from "../../types/httpErrors";

export default async function users(app: FastifyInstance) {
  app.post(
    "/csv",
    {
      //preValidation: app.verifyUser,
      schema: {
        response: {
          202: Type.Null(),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    async function jobHandler(request, _reply) {
      await importCsvFromRequest({ req: request, pool: app.pg.pool });
    },
  );
}
