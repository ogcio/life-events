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
  UserInvitation,
  UserInvitationSchema,
  UsersImportSchema,
  UsersImport,
} from "../../types/usersSchemaDefinitions";
import {
  READ_USER_IMPORTS_ERROR,
  getAllUserInvitationsForOrganisation,
  getUserImportForOrganisation,
  getUserImportsForOrganisation,
  getUserInvitationsForImport,
} from "../../services/users/import/read-user-imports";
import { organisationId } from "../../utils";
import { BadRequestError } from "shared-errors";
import { getOrganisationIdFromRequest } from "../../utils/request-utils";
import { Permissions } from "../../types/permissions";

const tags = ["Users", "UserImports"];

/*
 * The routes in this file are meant to be used on the "organisation" side
 */
export default async function usersImports(app: FastifyInstance) {
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
        consumes: ["multipart/form-data"],
      },
    },
    async (request: FastifyRequest, _reply: FastifyReply) => {
      // exclamation mark used here because we have
      // verifyUser preValidation
      await importCsvFileFromRequest({
        filepath: await saveRequestFile(request),
        user: request.userData!,
        pg: app.pg,
        logger: request.log,
      });
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
    "/",
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
        requestUser: request.userData!,
      });
    },
  );

  interface GetImportsSchema {
    Querystring: { organisationId?: string };
    Response: { data: Omit<UsersImport, "usersData">[] };
  }

  app.get<GetImportsSchema>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Citizen.Read]),
      schema: {
        tags,
        querystring: Type.Optional(
          Type.Object({
            organisationId: Type.Optional(Type.String()),
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
        organisationId: getOrganisationIdFromRequest(
          request,
          READ_USER_IMPORTS_ERROR,
        ),
      }),
    }),
  );

  app.get<Omit<GetUserInvitationsSchema, "Params">>(
    "/users",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        querystring: Type.Optional(
          Type.Object({
            organisationId: Type.Optional(Type.String()),
          }),
        ),
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
      request: FastifyRequest<Omit<GetUserInvitationsSchema, "Params">>,
      _reply: FastifyReply,
    ) => ({
      data: await getAllUserInvitationsForOrganisation({
        logger: request.log,
        pool: app.pg.pool,
        organisationId: getOrganisationIdFromRequest(
          request,
          READ_USER_IMPORTS_ERROR,
        ),
      }),
    }),
  );

  interface GetImportSchema {
    Querystring: { organisationId?: string; includeUsersData?: boolean };
    Response: { data: UsersImport };
    Params: { importId: string };
  }
  app.get<GetImportSchema>(
    "/:importId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        querystring: Type.Optional(
          Type.Object({
            organisationId: Type.Optional(Type.String()),
            includeUsersData: Type.Boolean({ default: true }),
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
        organisationId: getOrganisationIdFromRequest(
          request,
          READ_USER_IMPORTS_ERROR,
        ),
        importId: request.params.importId,
        includeUsersData: request.query.includeUsersData ?? true,
      }),
    }),
  );

  interface GetUserInvitationsSchema {
    Querystring: { organisationId?: string };
    Response: { data: UserInvitation[] };
    Params: { importId: string };
  }

  app.get<GetUserInvitationsSchema>(
    "/:importId/users",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        querystring: Type.Optional(
          Type.Object({
            organisationId: Type.Optional(Type.String()),
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
        organisationId: getOrganisationIdFromRequest(
          request,
          READ_USER_IMPORTS_ERROR,
        ),
        importId: request.params.importId,
      }),
    }),
  );

  app.get(
    "/mock-organisation-id",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        response: {
          200: Type.Object({
            data: Type.String({ format: "uuid" }),
          }),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async (_request: FastifyRequest, _reply: FastifyReply) => ({
      data: organisationId,
    }),
  );

  const saveRequestFile = async (request: FastifyRequest): Promise<string> => {
    const file = await request.files();
    if (!file) {
      throw new BadRequestError(
        IMPORT_USERS_ERROR,
        "File is missing in the request",
      );
    }

    const savedFiles = await request.saveRequestFiles();

    return savedFiles[0].filepath;
  };
}
