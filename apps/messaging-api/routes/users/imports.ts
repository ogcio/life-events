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
enum MimeTypes {
  Json = "application/json",
  FormData = "multipart/form-data",
}
/*
 * The routes in this file are meant to be used on the "organisation" side
 */
export default async function usersImports(app: FastifyInstance) {
  app.get(
    "/csv/template",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Citizen.Read]),
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

  app.post<{ Body: CsvRecord[] | undefined }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Citizen.Write]),
      schema: {
        tags,
        body: Type.Union([Type.Array(CsvRecordSchema), Type.Unknown()]),
        response: {
          202: Type.Null(),
          "5xx": HttpError,
          "4xx": HttpError,
        },
        consumes: [MimeTypes.FormData, MimeTypes.Json],
      },
    },
    async (request: FastifyRequest, _reply: FastifyReply) => {
      if (
        request.headers["content-type"] &&
        request.headers["content-type"].startsWith(MimeTypes.FormData)
      ) {
        await importCsvFileFromRequest({
          filepath: await saveRequestFile(request),
          user: request.userData!,
          pg: app.pg,
          logger: request.log,
        });
        return;
      }

      await importCsvRecords({
        pg: app.pg,
        logger: request.log,
        csvRecords: request.body as CsvRecord[],
        requestUser: request.userData!,
      });
    },
  );

  interface GetImportsSchema {
    Response: { data: Omit<UsersImport, "usersData">[] };
    Querystring: unknown;
  }

  app.get<GetImportsSchema>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Citizen.Read]),
      schema: {
        tags,
        response: {
          200: getGenericResponseSchema(
            Type.Array(Type.Omit(UsersImportSchema, ["usersData"])),
          ),
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
        organisationId: request.userData!.organizationId!,
      }),
    }),
  );

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
