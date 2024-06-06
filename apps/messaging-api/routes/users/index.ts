import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import {
  IMPORT_USERS_ERROR,
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
  UsersImportSchema,
  UsersImport,
} from "../../types/usersSchemaDefinitions";
import {
  getInvitationForUser,
  updateInvitationStatus,
  updateOrganisationFeedback,
} from "../../services/users/invitations/accept-invitations";
import { createError } from "@fastify/error";
import {
  READ_USER_IMPORTS_ERROR,
  getUserImportForOrganisation,
  getUserImportsForOrganisation,
  getUserInvitationsForImport,
} from "../../services/users/import/read-user-imports";

const tags = ["Users"];

export default async function users(app: FastifyInstance) {
  app.post(
    "/imports/csv",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        response: {
          202: Type.Null(),
          "5xx": HttpError,
          "4xx": HttpError,
        },
        consumes: ["multipart/form-data"],
      },
    },
    async (request: FastifyRequest, _reply: FastifyReply) => {
      // exclamation mark used here because we have
      // verifyUser preValidation
      await importCsvFileFromRequest({
        filepath: await saveRequestFile(request),
        user: request.user!,
        pg: app.pg,
        logger: request.log,
      });
    },
  );

  app.get(
    "/imports/csv/template",
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
    "/imports",
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
        userProfileId: request.user!.id,
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
        userProfileId: request.user!.id,
        pg: app.pg,
        feedback: request.body,
      }),
    }),
  );

  interface GetImportsSchema {
    Querystring: { organisationId?: string };
    Response: { data: Omit<UsersImport, "usersData">[] };
  }

  app.get<GetImportsSchema>(
    "/imports",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        querystring: Type.Optional(
          Type.Object({
            organisationId: Type.Optional(Type.String({ format: "uuid" })),
          }),
        ),
        response: {
          200: Type.Object({
            data: Type.Array(Type.Omit(UsersImportSchema, ["usersData"])),
          }),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async (
      request: FastifyRequest<GetImportsSchema>,
      _reply: FastifyReply,
    ) => ({
      data: await getUserImportsForOrganisation({
        logger: request.log,
        pool: app.pg.pool,
        organisationId: getOrganisationIdFromRequest(request),
      }),
    }),
  );

  interface GetImportSchema {
    Querystring: { organisationId?: string };
    Response: { data: UsersImport };
    Params: { importId: string };
  }
  app.get<GetImportSchema>(
    "/imports/:importId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        querystring: Type.Optional(
          Type.Object({
            organisationId: Type.Optional(Type.String({ format: "uuid" })),
          }),
        ),
        params: Type.Object({ importId: Type.String({ format: "uuid" }) }),
        response: {
          200: Type.Object({
            data: UsersImportSchema,
          }),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async (request: FastifyRequest<GetImportSchema>, _reply: FastifyReply) => ({
      data: await getUserImportForOrganisation({
        logger: request.log,
        pool: app.pg.pool,
        organisationId: getOrganisationIdFromRequest(request),
        importId: request.params.importId,
      }),
    }),
  );

  interface GetUserInvitationsSchema {
    Querystring: { organisationId?: string };
    Response: { data: UserInvitation[] };
    Params: { importId: string };
  }
  app.get<GetUserInvitationsSchema>(
    "/imports/:importId/users",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        querystring: Type.Optional(
          Type.Object({
            organisationId: Type.Optional(Type.String({ format: "uuid" })),
          }),
        ),
        params: Type.Object({ importId: Type.String({ format: "uuid" }) }),
        response: {
          200: Type.Object({
            data: Type.Array(UserInvitationSchema),
          }),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async (
      request: FastifyRequest<GetUserInvitationsSchema>,
      _reply: FastifyReply,
    ) => ({
      data: await getUserInvitationsForImport({
        logger: request.log,
        pool: app.pg.pool,
        organisationId: getOrganisationIdFromRequest(request),
        importId: request.params.importId,
      }),
    }),
  );

  const saveRequestFile = async (request: FastifyRequest): Promise<string> => {
    const file = await request.files();
    if (!file) {
      throw createError(
        IMPORT_USERS_ERROR,
        "File is missing in the request",
        400,
      )();
    }

    const savedFiles = await request.saveRequestFiles();

    return savedFiles[0].filepath;
  };

  const getOrganisationIdFromRequest = (request: FastifyRequest): string => {
    const query = request.query as { organisationId?: string };
    // organisationId query parameter added to
    // make us able to test it until we won't have
    // an organisation id set into the logged in user
    const organisationId =
      request.user!.organisation_id ?? query.organisationId;
    if (!organisationId) {
      throw createError(
        READ_USER_IMPORTS_ERROR,
        "Cannot retrieve an organisation id",
        400,
      )();
    }

    return organisationId;
  };
}
