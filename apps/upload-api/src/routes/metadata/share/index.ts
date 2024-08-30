import { Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import { Permissions } from "../../../types/permissions.js";
import { HttpError } from "../../../types/httpErrors.js";
import {
  getGenericResponseSchema,
  ResponseMetadata,
} from "../../../types/schemaDefinitions.js";

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
          //TODO: CHANGE ME
          200: getGenericResponseSchema(Type.Any()),
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async (request, reply) => {
      const { fileId, userId } = request.body;

      // TODO: IMPLEMENT THIS

      reply.send({ data: {} });
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
          200: getGenericResponseSchema(ResponseMetadata),
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async (request, reply) => {
      const { fileId, userId } = request.body;

      // TODO: IMPLEMENT THIS

      return reply.send({ data: {} });
    },
  );
}
