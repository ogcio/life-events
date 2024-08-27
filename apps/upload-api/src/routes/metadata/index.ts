import { FastifyInstance } from "fastify";
import { Permissions } from "../../types/permissions.js";
import {
  FileMetadataType,
  FileOwnerType,
  getGenericResponseSchema,
  ResponseMetadata,
} from "../../types/schemaDefinitions.js";
import { Type } from "@sinclair/typebox";
import { HttpError } from "../../types/httpErrors.js";
import {
  ensureUserIdIsSet,
  getProfileSdk,
} from "../../utils/authentication-factory.js";
import { NotFoundError, ServerError } from "shared-errors";
import { getOwnedFiles, getOrganizationFiles } from "../utils/filesMetadata.js";
import getFileMetadataById from "../utils/getFileMetadataById.js";

const METADATA_INDEX = "METADATA_INDEX";
const GET_METADATA = "GET_METADATA";

const API_DOCS_TAG = "Metadata";

export default async function routes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [
          Permissions.Upload.Read,
          Permissions.UploadSelf.Read,
        ]),
      schema: {
        tags: [API_DOCS_TAG],
        response: {
          200: getGenericResponseSchema(Type.Array(ResponseMetadata)),
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = ensureUserIdIsSet(request, METADATA_INDEX);
      const organizationId = request.userData?.organizationId;
      const files: FileMetadataType[] = [];

      const client = await app.pg.pool.connect();
      try {
        const ownedFilesData = await getOwnedFiles(client, userId);
        const ownedFiles = ownedFilesData.rows;

        files.push(...ownedFiles);

        const filesToExclude = ownedFiles.map(({ id }) => id as string);

        if (organizationId) {
          const organizationFilesData = await getOrganizationFiles(
            client,
            organizationId,
            filesToExclude,
          );

          if (organizationFilesData.rows.length > 0) {
            files.push(...organizationFilesData.rows);
          }
        }
      } catch (err) {
        throw new ServerError(METADATA_INDEX, "Internal server error", err);
      }

      const userIds = files.map((f) => f.ownerId);
      let usersData: { [key: string]: FileOwnerType };

      if (files.length === 0) {
        return reply.send({ data: [] });
      }

      const profileSdk = await getProfileSdk(organizationId);
      try {
        const usersResponse = await profileSdk.selectUsers(userIds);

        if (usersResponse.error) {
          throw new ServerError(
            METADATA_INDEX,
            "Internal server error",
            usersResponse.error,
          );
        }

        if (usersResponse.data) {
          usersData = usersResponse.data.reduce(
            (acc, next) => ({ ...acc, [next.id]: next }),
            {},
          );
        }
      } catch (err) {
        throw new ServerError(METADATA_INDEX, "Internal server error", err);
      }
      const filesData = files.map((f) => ({
        ...f,
        owner: undefined,
      }));

      reply.send({ data: filesData });
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
      const userId = ensureUserIdIsSet(request, GET_METADATA);
      const organizationId = request.userData?.organizationId;

      const fileId = request.params.id;

      let file: FileMetadataType | undefined = undefined;
      try {
        const fileData = await getFileMetadataById(
          app.pg,
          fileId,
          userId,
          organizationId,
        );
        if (fileData.rows) {
          file = fileData.rows[0];
        }
      } catch (err) {
        throw new ServerError(METADATA_INDEX, "Internal server error", err);
      }

      if (!file) {
        throw new NotFoundError(GET_METADATA, "File not found");
      }

      const profileSdk = await getProfileSdk(organizationId);

      let userData: FileOwnerType | undefined = undefined;
      try {
        const usersResponse = await profileSdk.selectUsers(userId);

        if (usersResponse.error) {
          throw new ServerError(
            METADATA_INDEX,
            "Internal server error",
            usersResponse.error,
          );
        }

        if (usersResponse.data) {
          userData = usersResponse.data[0];
        }
      } catch (err) {
        throw new ServerError(METADATA_INDEX, "Internal server error", err);
      }

      const fileMetadata = { ...file, owner: userData };

      return reply.send({ data: fileMetadata });
    },
  );
}
