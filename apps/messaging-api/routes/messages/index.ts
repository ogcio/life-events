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
import { newMessagingService } from "../../services/messages/messaging";
import {
  getUserProfiles,
  ProfileSdkFacade,
} from "../../services/users/shared-users";
import { Profile } from "building-blocks-sdk";
import { NotFoundError, ServerError } from "shared-errors";

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
            type: Type.Optional(Type.String()),
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

  app.post<{
    Body: {
      templateMetaId: string;
      userIds: string[];
      transportations: string[];
      security: string;
      scheduleAt: string;
    };
  }>(
    "/template",
    {
      preValidation: app.verifyUser,
      schema: {
        body: Type.Object({
          templateMetaId: Type.String({ format: "uuid" }),
          userIds: Type.Array(Type.String({ format: "uuid" })),
          transportations: Type.Array(
            Type.Union([
              Type.Literal("email"),
              Type.Literal("sms"),
              Type.Literal("lifeEvent"),
            ]),
          ),
          security: Type.String(),
          scheduleAt: Type.String({ format: "date-time" }),
        }),
      },
    },
    async (req, _res) => {
      const errorKey = "FAILED_TO_CREATE_MESSAGE_FROM_TEMPLATE";

      // Get users
      const profileSdk = new Profile(req.user!.id);
      const messageSdk = {
        selectUsers(ids: string[]) {
          return getUserProfiles(ids, app.pg.pool);
        },
      };

      const profileService = ProfileSdkFacade(profileSdk, messageSdk);
      const allUsers = await profileService.selectUsers(req.body.userIds);

      if (allUsers.error) {
        throw new ServerError(errorKey, "couldn't fetch user profiles");
      }

      if (!allUsers.data?.length) {
        throw new NotFoundError(errorKey, "no receiver profiles found");
      }

      // Get template contents
      const messageService = newMessagingService(app.pg.pool);

      const contents = await messageService.getTemplateContents(
        req.body.templateMetaId,
      );

      if (!contents.length) {
        throw new NotFoundError(errorKey, "no template contents found");
      }

      // Create messages
      let messageAndUserIds: Awaited<
        ReturnType<typeof messageService.createTemplateMessages>
      > = [];
      try {
        messageAndUserIds = await messageService.createTemplateMessages(
          contents,
          allUsers.data.map((u) => ({ ...u, userId: u.id })),
          req.body.transportations,
          req.body.security,
        );
      } catch (err) {
        throw new ServerError(
          errorKey,
          "failed to create messages from template",
        );
      }

      // Schedule messages
      try {
        await messageService.scheduleMessages(
          messageAndUserIds,
          req.body.scheduleAt,
        );
      } catch (err) {
        throw new ServerError(errorKey, "failed to send messages to scheduler");
      }
    },
  );
}
