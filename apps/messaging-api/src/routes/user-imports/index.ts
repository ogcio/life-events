import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Permissions } from "../../types/permissions.js";
import { Type } from "@sinclair/typebox";
import {
  getCsvExample,
  IMPORT_USERS_ERROR,
  importCsvFileFromRequest,
  importCsvRecords,
} from "../../services/users/import/import-users.js";
import {
  CsvRecord,
  CsvRecordSchema,
  UsersImport,
  UsersImportSchema,
} from "../../types/usersSchemaDefinitions.js";
import {
  AcceptedQueryBooleanValues,
  getGenericResponseSchema,
  PaginationParams,
  PaginationParamsSchema,
  parseBooleanEnum,
  TypeboxBooleanEnum,
} from "../../types/schemaDefinitions.js";
import {
  getUserImportForOrganisation,
  getUserImportsForOrganisation,
} from "../../services/users/import/read-user-imports.js";
import { HttpError } from "../../types/httpErrors.js";
import { BadRequestError } from "shared-errors";
import { ensureOrganizationIdIsSet } from "../../utils/authentication-factory.js";
import {
  formatAPIResponse,
  sanitizePagination,
} from "../../utils/pagination.js";

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
    Querystring: PaginationParams;
  }

  app.get<GetImportsSchema>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Citizen.Read]),
      schema: {
        description:
          "Retrieves the user import batches related to the current organisation",
        tags,
        querystring: Type.Optional(PaginationParamsSchema),
        response: {
          200: getGenericResponseSchema(
            Type.Array(Type.Omit(UsersImportSchema, ["usersData"])),
          ),
        },
      },
    },
    async (request: FastifyRequest<GetImportsSchema>, _reply: FastifyReply) => {
      const pagination = sanitizePagination(request.query);
      const response = await getUserImportsForOrganisation({
        logger: request.log,
        pool: app.pg.pool,
        organisationId: ensureOrganizationIdIsSet(request, "GET_USER_IMPORTS"),
        pagination,
      });

      return formatAPIResponse({
        data: response.data,
        totalCount: response.totalCount,
        request,
      });
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
          200: Type.Object({
            data: Type.Object({
              id: Type.String({ format: "uuid" }),
            }),
          }),
          "5xx": HttpError,
          "4xx": HttpError,
        },
        consumes: [MimeTypes.FormData, MimeTypes.Json],
        description:
          "Imports a new batch of users. If 'Content-Type' header contains 'multipart/form-data' it accepts a CSV file, otherwise an array of users to import",
      },
    },
    async (request: FastifyRequest, _reply: FastifyReply) => {
      if (
        request.headers["content-type"] &&
        request.headers["content-type"].startsWith(MimeTypes.FormData)
      ) {
        const importedId = await importCsvFileFromRequest({
          filepath: await saveRequestFile(request),
          user: request.userData!,
          pg: app.pg,
          logger: request.log,
        });

        return { data: { id: importedId } };
      }

      const importedId = await importCsvRecords({
        pg: app.pg,
        logger: request.log,
        csvRecords: request.body as CsvRecord[],
        requestUser: request.userData!,
      });

      return { data: { id: importedId } };
    },
  );

  interface GetImportSchema {
    Querystring: { includeImportedData?: AcceptedQueryBooleanValues };
    Response: { data: UsersImport };
    Params: { importId: string };
  }

  app.get<GetImportSchema>(
    "/:importId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Citizen.Read]),
      schema: {
        description: "Retrieves the requested user import batch",
        tags,
        querystring: Type.Optional(
          Type.Object({
            includeImportedData: Type.Optional(
              TypeboxBooleanEnum(
                "true",
                "If true, it returns the data of the user sent in the import batch",
              ),
            ),
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
        organisationId: ensureOrganizationIdIsSet(request, "GET_USER_IMPORT"),
        importId: request.params.importId,
        includeUsersData: parseBooleanEnum(
          request.query.includeImportedData ?? "true",
        ),
      }),
    }),
  );

  app.get(
    "/template-download",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Citizen.Read]),
      schema: {
        tags,
        response: {
          200: Type.String({
            description:
              "The header and one example line for the CSV template that must be used to import users",
          }),
        },
        produces: [MimeTypes.Csv],
        description:
          "Returns a string containing the template with the csv that will be used to import users",
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const buffer = await getCsvExample();

      reply.type("text/csv").send(buffer);
    },
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
