// Remove users/imports/users and replace "recipients" with just "users" combining data from users/imports/users

import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Permissions } from "../../types/permissions";
import { Type } from "@sinclair/typebox";
import {
  getCsvExample,
  IMPORT_USERS_ERROR,
  importCsvFileFromRequest,
  importCsvRecords,
} from "../../services/users/import/import-users";
import {
  CsvRecord,
  CsvRecordSchema,
  User,
  UserSchema,
  UsersImport,
  UsersImportSchema,
} from "../../types/usersSchemaDefinitions";
import { getGenericResponseSchema } from "../../types/schemaDefinitions";
import {
  getUserImportForOrganisation,
  getUserImportsForOrganisation,
  getUserInvitationsForImport,
} from "../../services/users/import/read-user-imports";
import { HttpError } from "../../types/httpErrors";
import { BadRequestError } from "shared-errors";

const tags = ["User Imports"];
enum MimeTypes {
  Json = "application/json",
  FormData = "multipart/form-data",
  Csv = "text/csv",
}

/*
 * The routes in this file are meant to be used on the "organisation" side
 */
export default async function userImports(app: FastifyInstance) {
  interface GetImportsSchema {
    Response: { data: Omit<UsersImport, "usersData">[] | string };
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
          200: Type.Union([
            getGenericResponseSchema(
              Type.Array(Type.Omit(UsersImportSchema, ["usersData"])),
            ),
            Type.String(),
          ]),
        },
        produces: [MimeTypes.Csv, MimeTypes.Json],
        description:
          "If 'Accept' headers is set as 'text/csv' it will return a string containing the template with the csv that will be used to import users",
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (request.headers.accept === "text/csv") {
        const buffer = await getCsvExample();

        reply.type("text/csv").send(buffer);

        return;
      }

      return {
        data: await getUserImportsForOrganisation({
          logger: request.log,
          pool: app.pg.pool,
          organisationId: request.userData!.organizationId!,
        }),
      };
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
        description:
          "If 'Content-Type' header contains 'multipart/form-data' it accepts a CSV file, otherwise an array of users to import",
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

  interface GetUsersSchema {
    Response: { data: User[] };
    Params: { importId: string };
    Querystring: unknown;
  }

  app.get<GetUsersSchema>(
    "/:importId/users",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Citizen.Read]),
      schema: {
        tags,
        params: Type.Object({ importId: Type.String({ format: "uuid" }) }),
        response: {
          200: getGenericResponseSchema(Type.Array(UserSchema)),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async (request: FastifyRequest<GetUsersSchema>, _reply: FastifyReply) => ({
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
