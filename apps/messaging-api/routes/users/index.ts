import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import {
  getCsvExample,
  importCsvFileFromRequest,
  importCsvRecords,
} from "../../services/users/import/import-users";
import { HttpError } from "../../types/httpErrors";
import { CsvRecord, CsvRecordSchema } from "../../types/usersSchemaDefinitions";

const tags = ["Users"];

export default async function users(app: FastifyInstance) {
  app.post(
    "/csv",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        response: {
          202: Type.Null(),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async (request: FastifyRequest, _reply: FastifyReply) => {
      await importCsvFileFromRequest({ req: request, pg: app.pg });
    },
  );

  app.get(
    "/csv/template",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
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

  app.post<{ Body: CsvRecord[] }>(
    "/import",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        body: Type.Array(CsvRecordSchema),
        response: {
          202: Type.Null(),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async (request: FastifyRequest, _reply: FastifyReply) => {
      await importCsvRecords({
        pg: app.pg,
        logger: request.log,
        csvRecords: request.body as CsvRecord[],
        requestUser: request.user!,
      });
    },
  );
}
