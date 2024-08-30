import { Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import { Permissions } from "../../../types/permissions.js";
import { HttpError } from "../../../types/httpErrors.js";
import { getGenericResponseSchema } from "../../../types/schemaDefinitions.js";
import addFileSharing from "./utils/addFileSharing.js";
import { ServerError } from "shared-errors";
import removeFileSharing from "./utils/removeFileSharing.js";

const SHARE_CREATE = "SHARE_CREATE";
const SHARE_DELETE = "SHARE_DELETE";

const API_DOCS_TAG = "Metadata share";

export default async function routes(app: FastifyInstance) {
  app.post<{ Body: { fileId: string; userId: string } }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Upload.Write]),
      schema: {
        tags: [API_DOCS_TAG],
        body: Type.Object({
          fileId: Type.String(),
          userId: Type.String(),
        }),
        response: {
          201: getGenericResponseSchema(
            Type.Object({ fileId: Type.String(), userId: Type.String() }),
          ),
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async (request, reply) => {
      const { fileId, userId } = request.body;
      try {
        await addFileSharing(app.pg, fileId, userId);
      } catch (err) {
        throw new ServerError(SHARE_CREATE, "Internal server error", err);
      }
      reply.status(201);
      reply.send({ data: { fileId, userId } });
    },
  );

  app.delete<{ Body: { fileId: string; userId: string } }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Upload.Write]),
      schema: {
        tags: [API_DOCS_TAG],
        body: Type.Object({
          fileId: Type.String(),
          userId: Type.String(),
        }),
        response: {
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async (request, reply) => {
      const { fileId, userId } = request.body;

      try {
        await removeFileSharing(app.pg, fileId, userId);
      } catch (err) {
        throw new ServerError(SHARE_DELETE, "Internal server error", err);
      }
      reply.send();
    },
  );
}
