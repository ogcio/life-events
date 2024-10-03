import { Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import { Permissions } from "../../../types/permissions.js";
import { HttpError as OutputHttpError } from "../../../types/httpErrors.js";
import {
  getGenericResponseSchema,
  Sharing,
} from "../../../types/schemaDefinitions.js";
import addFileSharing from "./utils/addFileSharing.js";
import removeFileSharing from "./utils/removeFileSharing.js";
import getFileSharings from "./utils/getFileSharings.js";

const API_DOCS_TAG = "Permissions";

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
          "4xx": OutputHttpError,
          "5xx": OutputHttpError,
        },
      },
    },
    async (request, reply) => {
      const { fileId, userId } = request.body;
      try {
        await addFileSharing(app.pg, fileId, userId);
      } catch (err) {
        throw app.httpErrors.createError(500, "Internal server error", {
          parent: err,
        });
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
          "4xx": OutputHttpError,
          "5xx": OutputHttpError,
        },
      },
    },
    async (request, reply) => {
      const { fileId, userId } = request.body;

      try {
        await removeFileSharing(app.pg, fileId, userId);
      } catch (err) {
        throw app.httpErrors.createError(500, "Internal server error", {
          parent: err,
        });
      }
      reply.send();
    },
  );

  app.get<{ Querystring: { fileId: string } }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Upload.Write]),
      schema: {
        tags: [API_DOCS_TAG],
        querystring: Type.Object({
          fileId: Type.String(),
        }),
        response: {
          "4xx": OutputHttpError,
          "5xx": OutputHttpError,
        },
      },
    },
    async (request) => {
      const { fileId } = request.query;
      try {
        const sharingsQueryResponse = await getFileSharings(app.pg, fileId);
        if (sharingsQueryResponse.rows.length) {
          return { data: sharingsQueryResponse.rows };
        }
      } catch (err) {
        throw app.httpErrors.createError(500, "Internal server error", {
          parent: err,
        });
      }
    },
  );
}
