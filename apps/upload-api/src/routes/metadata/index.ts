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
import { BadRequestError, NotFoundError, ServerError } from "shared-errors";
import {
  getOwnedFiles,
  getOrganizationFiles,
  getSharedFiles,
} from "./utils/filesMetadata.js";
import getFileMetadataById from "../utils/getFileMetadataById.js";
import getFileSharings from "./utils/getFileSharings.js";
import scheduleFileForDeletion from "./utils/scheduleFileForDeletion.js";
import removeAllFileSharings from "./utils/removeAllFileSharings.js";

const METADATA_INDEX = "METADATA_INDEX";
const GET_METADATA = "GET_METADATA";
const SCHEDULE_DELETION = "SCHEDULE_DELETION";

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
        querystring: Type.Optional(
          Type.Object({
            userId: Type.Optional(Type.String()),
          }),
        ),
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
      const userIds = new Set<string>();
      try {
        const ownedFilesData = await getOwnedFiles(client, userId);

        const ownedFiles = ownedFilesData.rows;

        files.push(...ownedFiles);
        files.forEach(({ ownerId }) => userIds.add(ownerId as string));
        const filesToExclude = ownedFiles.map(({ id }) => id as string);

        if (organizationId) {
          const organizationFilesData = await getOrganizationFiles(
            client,
            organizationId,
            filesToExclude,
          );

          if (organizationFilesData.rows.length) {
            files.push(...organizationFilesData.rows);
            organizationFilesData.rows.forEach(({ ownerId }) =>
              userIds.add(ownerId),
            );
            filesToExclude.push(
              ...organizationFilesData.rows.map(({ id }) => id as string),
            );
          }
        }

        const sharedFilesData = await getSharedFiles(
          client,
          userId,
          filesToExclude,
        );

        if (sharedFilesData.rows.length) {
          sharedFilesData.rows.map(({ ownerId }) => userIds.add(ownerId));
          files.push(...sharedFilesData.rows);
        }
      } catch (err) {
        throw new ServerError(METADATA_INDEX, "Internal server error", err);
      } finally {
        client.release();
      }

      if (files.length === 0) {
        return reply.send({ data: [] });
      }

      const usersData = await getUsersData({
        userIds: Array.from(userIds.keys()),
        organizationId,
      });

      const filesData = files.map((f) => ({
        ...f,
        owner: usersData?.[f.ownerId],
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
      const organizationId = request.userData?.organizationId;

      const fileId = request.params.id;

      let file: FileMetadataType | undefined = undefined;
      const usersToRetrieve = new Set<string>();

      try {
        const fileData = await getFileMetadataById(app.pg, fileId);
        if (fileData.rows) {
          file = fileData.rows[0];
        }

        if (!file) {
          return new NotFoundError(GET_METADATA, "File not found");
        }

        usersToRetrieve.add(file.ownerId);

        const sharingsData = await getFileSharings(app.pg, fileId);

        if (sharingsData.rows) {
          sharingsData.rows.forEach(({ userId }) =>
            usersToRetrieve.add(userId),
          );
        }
      } catch (err) {
        throw new ServerError(GET_METADATA, "Internal server error", err);
      }

      const profileSdk = await getProfileSdk(organizationId);

      let users: FileOwnerType[] = [];
      let fileOwner: FileOwnerType | undefined;
      try {
        const usersData = await profileSdk.selectUsers(
          Array.from(usersToRetrieve.keys()),
        );

        if (usersData.error) {
          return new ServerError(
            GET_METADATA,
            "Internal server error",
            usersData.error,
          );
        }

        if (usersData.data) {
          fileOwner = usersData.data.filter(({ id }) => file.ownerId === id)[0];
          users = usersData.data.filter(({ id }) => file.ownerId !== id);
        }
      } catch (err) {
        throw new ServerError(GET_METADATA, "Internal server error", err);
      }

      const fileMetadata = { ...file, owner: fileOwner, sharedWith: users };

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
        const currentDate = new Date();

        const deletionDate = new Date(currentDate);
        deletionDate.setDate(currentDate.getDate() + 30);

        await scheduleFileForDeletion(app.pg, fileId, deletionDate);

        await removeAllFileSharings(app.pg, fileId);
      } catch (err) {
        throw new ServerError(SCHEDULE_DELETION, "Internal server error", err);
      }

      reply.send({ data: { id: fileId } });
    },
  );

  const getUsersData = async (params: {
    userIds: string[];
    organizationId?: string;
  }): Promise<{ [key: string]: FileOwnerType }> => {
    const profileSdk = await getProfileSdk(params.organizationId);
    try {
      const usersResponse = await profileSdk.selectUsers(params.userIds);

      if (usersResponse.error) {
        throw new ServerError(
          METADATA_INDEX,
          "Error retrieving users data",
          usersResponse.error,
        );
      }

      if (usersResponse.data) {
        return usersResponse.data.reduce(
          (acc, next) => ({ ...acc, [next.id]: next }),
          {},
        );
      }

      return {};
    } catch (err) {
      throw new ServerError(METADATA_INDEX, "Internal server error", err);
    }
  };
}
