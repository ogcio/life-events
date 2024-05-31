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
  OrganisationInvitationFeedbackSchema,
  OrganisationInvitationFeedback,
  UserInvitation,
  UserInvitationSchema,
  User,
  InvitationFeedback,
  InvitationFeedbackSchema,
  UserSchema,
} from "../../types/usersSchemaDefinitions";
import {
  getInvitationForUser,
  updateInvitationStatus,
  updateOrganisationFeedback,
} from "../../services/users/invitations/accept-invitations";

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
      // exclamation mark used here because we have
      // verifyUser preValidation
      await importCsvFileFromRequest({
        req: { ...request, user: request.user! },
        pg: app.pg,
      });
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
        userProfileId: request.user!.id,
        organisationId: request.params.organisationId,
        pg: app.pg,
      }),
    }),
  );

  interface PatchOrgInvitationSchema {
    Params: { organisationId: string };
    Body: OrganisationInvitationFeedback;
    Response: { data: UserInvitation };
  }

  app.patch<PatchOrgInvitationSchema>(
    "/invitations/:organisationId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        body: OrganisationInvitationFeedbackSchema,
        params: Type.Object({
          organisationId: Type.String({ format: "uuid" }),
        }),
        response: {
          202: Type.Object({ data: UserInvitationSchema }),
          400: HttpError,
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (
      request: FastifyRequest<PatchOrgInvitationSchema>,
      _reply: FastifyReply,
    ) => ({
      data: await updateOrganisationFeedback({
        userId: request.user!.id,
        organisationId: request.params.organisationId,
        pg: app.pg,
        feedback: request.body,
      }),
    }),
  );

  interface PatchInvitationSchema {
    Body: InvitationFeedback;
    Response: { data: User };
  }

  app.patch<PatchInvitationSchema>(
    "/invitations",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        body: InvitationFeedbackSchema,
        response: {
          202: Type.Object({ data: UserSchema }),
          400: HttpError,
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (
      request: FastifyRequest<PatchInvitationSchema>,
      _reply: FastifyReply,
    ) => ({
      data: await updateInvitationStatus({
        userId: request.user!.id,
        pg: app.pg,
        feedback: request.body,
      }),
    }),
  );
}
