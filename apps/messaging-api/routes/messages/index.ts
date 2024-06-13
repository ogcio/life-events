import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import {
  CreateMessage,
  CreateMessageSchema,
  ReadMessageSchema,
  ReadMessagesSchema,
} from "../../types/schemaDefinitions";
import {
  createMessage,
  executeJob,
  getMessage,
  getMessages,
} from "../../services/messages/messages";

const MESSAGES_TAGS = ["Messages"];

interface GetAllMessages {
  Querystring: {
    type?: string;
  };
}

interface GetMessage {
  Params: {
    messageId: string;
  };
}

export default async function messages(app: FastifyInstance) {
  app.post<{ Params: { id: string } }>(
    "/jobs/:id",
    {
      preValidation: app.verifyUser,
      schema: {
        response: {
          202: Type.Null(),
          "5xx": { $ref: "HttpError" },
          "4xx": { $ref: "HttpError" },
        },
      },
    },
    async function jobHandler(request, reply) {
      await executeJob({
        pg: app.pg,
        logger: request.log,
        jobId: request.params!.id,
      });

      reply.statusCode = 202;
    },
  );

  // All messages
  app.get<GetAllMessages>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: MESSAGES_TAGS,
        querystring: Type.Optional(
          Type.Object({
            type: Type.String(),
          }),
        ),
        response: {
          200: Type.Object({
            data: ReadMessagesSchema,
          }),
          400: { $ref: "HttpError" },
        },
      },
    },
    async function getMessagesHandler(request, _reply) {
      return {
        data: await getMessages({
          pg: app.pg,
          userId: request.user!.id,
          transportType: request.query?.type,
        }),
      };
    },
  );

  // Message by id
  app.get<GetMessage>(
    "/:messageId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: MESSAGES_TAGS,
        params: {
          messageId: Type.String({
            format: "uuid",
          }),
        },
        response: {
          200: Type.Object({
            data: ReadMessageSchema,
          }),
          "4xx": { $ref: "HttpError" },
          "5xx": { $ref: "HttpError" },
        },
      },
    },
    async function getMessageHandler(request, _reply) {
      return {
        data: await getMessage({
          pg: app.pg,
          userId: request.user!.id,
          messageId: request.params.messageId,
        }),
      };
    },
  );

  // Message create
  app.post<{
    Body: CreateMessage;
  }>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: MESSAGES_TAGS,
        body: CreateMessageSchema,
        response: {
          "4xx": { $ref: "HttpError" },
          "5xx": { $ref: "HttpError" },
        },
      },
    },
    async function createMessageHandler(request, _reply) {
      return createMessage({ payload: request.body, pg: app.pg });
    },
  );
}
