import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import {
  getCsvExample,
  importCsvFileFromRequest,
  importCsvRecords,
} from "../../services/users/import/import-users";
import { HttpError } from "../../types/httpErrors";
import {
  CsvRecord,
  CsvRecordSchema,
  UserInvitation,
  UserInvitationSchema,
} from "../../types/usersSchemaDefinitions";
import { getInvitationForUser } from "../../services/users/invitations/accept-invitations";

const tags = ["Users"];

export default async function users(app: FastifyInstance) {
  app.post(
    "/import/csv",
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
    "/import/csv/template",
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

  app.get<{
    Params: { organisationId: string };
    Response: { data: UserInvitation };
  }>(
    "/invitations/:organisationId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        params: Type.Object({
          organisationId: Type.String({ format: "uuid" }),
        }),
        response: {
          200: Type.Object({ data: UserInvitationSchema }),
          400: HttpError,
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: { organisationId: string };
        Response: { data: UserInvitation };
      }>,
      _reply: FastifyReply,
    ) => ({
      data: await getInvitationForUser({
        userId: request.user!.id,
        organisationId: request.params.organisationId,
        pg: app.pg,
      }),
    }),
  );
}
