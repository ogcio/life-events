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
  getAllUserInvitationsForOrganisation,
  getUserImportForOrganisation,
  getUserImportsForOrganisation,
  getUserInvitationsForImport,
} from "../../services/users/import/read-user-imports";
import { BadRequestError } from "shared-errors";
import { Permissions } from "../../types/permissions";
import { getGenericResponseSchema } from "../../types/schemaDefinitions";

const tags = ["Users", "UserImports"];

/*
 * The routes in this file are meant to be used on the "organisation" side
 */
export default async function usersImports(app: FastifyInstance) {
  app.get<Omit<GetUserInvitationsSchema, "Params">>(
    "/users",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Citizen.Read]),
      schema: {
        tags,
        response: {
          200: getGenericResponseSchema(Type.Array(UserInvitationSchema)),
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
        organisationId: request.userData!.organizationId!,
      }),
    }),
  );

  interface GetImportSchema {
    Querystring: { includeUsersData?: boolean };
    Response: { data: UsersImport };
    Params: { importId: string };
  }
  app.get<GetImportSchema>(
    "/:importId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Citizen.Read]),
      schema: {
        tags,
        querystring: Type.Optional(
          Type.Object({
            includeUsersData: Type.Boolean({ default: true }),
          }),
        ),
        params: Type.Object({ importId: Type.String({ format: "uuid" }) }),
        response: {
          200: getGenericResponseSchema(UsersImportSchema),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async (request: FastifyRequest<GetImportSchema>, _reply: FastifyReply) => ({
      data: await getUserImportForOrganisation({
        logger: request.log,
        pool: app.pg.pool,
        organisationId: request.userData!.organizationId!,
        importId: request.params.importId,
        includeUsersData: request.query.includeUsersData ?? true,
      }),
    }),
  );

  interface GetUserInvitationsSchema {
    Response: { data: UserInvitation[] };
    Params: { importId: string };
    Querystring: unknown;
  }

  app.get<GetUserInvitationsSchema>(
    "/:importId/users",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Citizen.Read]),
      schema: {
        tags,
        params: Type.Object({ importId: Type.String({ format: "uuid" }) }),
        response: {
          200: getGenericResponseSchema(Type.Array(UserInvitationSchema)),
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
        organisationId: request.userData!.organizationId!,
        importId: request.params.importId,
      }),
    }),
  );
}
