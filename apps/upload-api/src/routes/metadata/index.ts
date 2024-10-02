import { FastifyInstance } from "fastify";
import { Permissions } from "../../types/permissions.js";
import {
  FileMetadataType,
  getGenericResponseSchema,
  ResponseMetadata,
} from "../../types/schemaDefinitions.js";
import { Type } from "@sinclair/typebox";
import { HttpError } from "../../types/httpErrors.js";
import { ensureUserIdIsSet } from "../../utils/authentication-factory.js";
import {
  AuthorizationError,
  BadRequestError,
  NotFoundError,
  ServerError,
} from "shared-errors";
import {
  getOrganizationFiles,
  getSharedFiles,
  scheduleFileForDeletion,
  getUserFiles,
} from "./utils/filesMetadata.js";
import getFileMetadataById from "../utils/getFileMetadataById.js";
import removeAllFileSharings from "./utils/removeAllFileSharings.js";

const METADATA_INDEX = "METADATA_INDEX";
const GET_METADATA = "GET_METADATA";
const SCHEDULE_DELETION = "SCHEDULE_DELETION";

const API_DOCS_TAG = "Metadata";

export default async function routes(app: FastifyInstance) {
  app.get<{ Querystring: { userId?: string; organizationId: string } }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [
          Permissions.Upload.Read,
          Permissions.UploadSelf.Read,
        ]),
      schema: {
        tags: [API_DOCS_TAG],
        querystring: Type.Optional(
          Type.Object({
            userId: Type.Optional(Type.String()),
            organizationId: Type.Optional(Type.String()),
          }),
        ),
        response: {
          200: getGenericResponseSchema(Type.Array(ResponseMetadata)),
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async (request) => {
      const userId = ensureUserIdIsSet(request, METADATA_INDEX);
      const organizationId = request.userData?.organizationId;
      ensureUserCanAccessResource({
        errorProcess: METADATA_INDEX,
        loggedInUserId: userId,
        queryUserId: request.query.userId,
        queryOrganizationId: request.query.organizationId,
        organizationId,
      });

      const client = await app.pg.pool.connect();

      const queryUserId = request.query.userId;

      const queryOrganizationId = request.query.organizationId;

      /**
       * if public servant
       * if queries user return all owned files + all shared files withhin org
       * if queries org return all org files withing org
       *
       * if no public servant return shared files
       */

      try {
        if (organizationId) {
          if (queryUserId) {
            const userFiles = await getUserFiles({
              client,
              organizationId,
              userId: queryUserId,
              toExclude: [],
            });
            return { data: userFiles };
          }

          if (queryOrganizationId && queryOrganizationId === organizationId) {
            const filesResponse = await getOrganizationFiles({
              client,
              organizationId,
              toExclude: [],
            });
            return { data: filesResponse.rows };
          }

          throw new BadRequestError(
            GET_METADATA,
            "You are not authorized to access other organization data",
          );
        }

        if (queryUserId === userId) {
          const sharedFiles = await getSharedFiles({
            client,
            userId: queryUserId,
            toExclude: [],
          });
          return { data: sharedFiles.rows };
        }

        throw new BadRequestError(
          GET_METADATA,
          "You are not authorized to access other users data",
        );
      } catch (e) {
        throw new ServerError(METADATA_INDEX, "Error getting files", e);
      } finally {
        client.release();
      }
    },
  );

  app.get<{ Params: { id: string } }>(
    "/:id",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [
          Permissions.UploadSelf.Read,
          Permissions.Upload.Read,
        ]),
      schema: {
        tags: [API_DOCS_TAG],
        params: Type.Object({ id: Type.String() }),
        response: {
          200: getGenericResponseSchema(ResponseMetadata),
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async (request, reply) => {
      const fileId = request.params.id;

      let file: FileMetadataType | undefined = undefined;

      try {
        const fileData = await getFileMetadataById(app.pg, fileId);
        if (fileData.rows) {
          file = fileData.rows[0];
        }

        if (!file) {
          return new NotFoundError(GET_METADATA, "File not found");
        }
      } catch (err) {
        throw new ServerError(GET_METADATA, "Error retrieving files", err);
      }

      const fileMetadata = {
        ...file,
        owner: file.ownerId,
      };

      return reply.send({ data: fileMetadata });
    },
  );

  app.delete<{ Body: { fileId: string } }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Upload.Write]),
      schema: {
        tags: [API_DOCS_TAG],
        body: Type.Object({ fileId: Type.String() }),
        response: {
          200: getGenericResponseSchema(Type.Object({ id: Type.String() })),
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async (request, reply) => {
      const fileId = request.body.fileId;

      if (!fileId) {
        throw new BadRequestError(SCHEDULE_DELETION, "File key not provided");
      }

      const fileData = await getFileMetadataById(app.pg, fileId);

      const file = fileData.rows?.[0];

      if (!file) {
        throw new NotFoundError(SCHEDULE_DELETION);
      }

      try {
        await scheduleFileForDeletion(app.pg, fileId);

        await removeAllFileSharings(app.pg, fileId);
      } catch (err) {
        throw new ServerError(SCHEDULE_DELETION, "Error deleting file", err);
      }

      reply.send({ data: { id: fileId } });
    },
  );
}

const ensureUserCanAccessResource = (params: {
  errorProcess: string;
  loggedInUserId: string;
  queryUserId?: string;
  queryOrganizationId?: string;
  organizationId?: string;
}) => {
  //public servant
  if (params.organizationId) {
    if (params.organizationId !== params.queryOrganizationId) {
      throw new AuthorizationError(
        params.errorProcess,
        "You are not allowed to access data for the requested organization",
      );
    }
    return;
  }

  if (params.loggedInUserId !== params.queryUserId) {
    throw new AuthorizationError(
      params.errorProcess,
      "You are not allowed to access data for the requested user",
    );
  }

  if (params.queryOrganizationId) {
    throw new AuthorizationError(
      params.errorProcess,
      "You are not allowed to access data for the requested organization",
    );
  }
};
