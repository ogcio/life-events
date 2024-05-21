import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import {
  getCsvExample,
  importCsvFromRequest,
} from "../../services/users/csv-import";
import { HttpError } from "../../types/httpErrors";

export default async function users(app: FastifyInstance) {
  app.post(
    "/csv",
    {
      preValidation: app.verifyUser,
      schema: {
        response: {
          202: Type.Null(),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    async (request: FastifyRequest, _reply: FastifyReply) => {
      await importCsvFromRequest({ req: request, pool: app.pg.pool });
    },
  );

  app.get(
    "/csv/template",
    {
      preValidation: app.verifyUser,
      schema: {
        response: {
          200: Type.String(),
        },
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const buffer = await getCsvExample();

      reply.type("text/csv").send(buffer);
    },
  );
}
