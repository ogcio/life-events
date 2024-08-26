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
import getUserFiles from "../utils/getUserFiles.js";
import getFileMetadata from "../utils/getFileMetadata.js";

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
      let files: FileMetadataType[];
      try {
        files = await getUserFiles(app.pg, userId, organizationId);
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
        owner: usersData[f.ownerId],
      }));

      reply.send({ data: filesData });
    },
  );

  app.get<{ Params: { key: string } }>(
    "/:key",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [
          Permissions.UploadSelf.Read,
          Permissions.Upload.Read,
        ]),
      schema: {
        tags: [API_DOCS_TAG],
        params: Type.Object({ key: Type.String() }),
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

      const key = request.params.key;
      const fileData = await getFileMetadata(
        app.pg,
        key,
        userId,
        organizationId,
      );

      const file = fileData.rows.length > 0 ? fileData.rows[0] : undefined;

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
