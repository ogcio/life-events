import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import {
  CreateMessage,
  CreateMessageSchema,
  MessageEventType,
  MessageEventTypeObject,
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
import {
  EventDataAggregation,
  MessagingEventType,
  newMessagingEventLogger,
} from "../../services/messages/eventLogger";
import { organisationId } from "../../utils";

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
        userId: request.user?.id || "", // we will require scheduler to callback same creds (jwt?) including the user id caller or include it somewhere else.
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
      scheduledAt: string;
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
          scheduledAt: Type.String({ format: "date-time" }),
        }),
      },
    },
    async (req, _res) => {
      const userId = req.user?.id!;
      const errorKey = "FAILED_TO_CREATE_MESSAGE_FROM_TEMPLATE";

      const eventLogger = newMessagingEventLogger(app.pg.pool);

      // Get users
      const profileSdk = new Profile(req.user!.id);
      const messageSdk = {
        selectUsers(ids: string[]) {
          return getUserProfiles(ids, app.pg.pool);
        },
      };

      const profileService = ProfileSdkFacade(profileSdk, messageSdk);
      const allUsers = await profileService.selectUsers(req.body.userIds);
      const sender = (await profileService.selectUsers([userId])).data?.at(0);

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

      const allUsersLookup = allUsers.data.reduce<{
        [userId: string]: (typeof allUsers.data)[0];
      }>((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});

      // Create messages
      let createdTemplateMessages: Awaited<
        ReturnType<typeof messageService.createTemplateMessages>
      > = [];
      try {
        createdTemplateMessages = await messageService.createTemplateMessages(
          contents,
          allUsers.data.map((u) => ({ ...u, userId: u.id })),
          req.body.transportations,
          req.body.security,
          req.body.scheduledAt,
        );

        await eventLogger.log(
          MessagingEventType.createRawMessage,
          createdTemplateMessages.map((msg) => {
            const user = allUsersLookup[msg.userId];
            return {
              excerpt: msg.excerpt,
              lang: msg.lang,
              messageId: msg.messageId,
              messageName: "", // message name isn't feature defined at this point
              plainText: msg.plainText,
              receiverFullName: `${user.firstName} ${user.lastName}`,
              receiverPPSN: user.ppsn,
              richText: msg.richText,
              subject: msg.subject,
              threadName: "", // thread name isn't feature defined at this point
              transports: req.body.transportations,
              scheduledAt: req.body.scheduledAt,
              organisationName: "test",
              senderFullName: sender
                ? `${sender.firstName} ${sender.lastName}`
                : "unknown",
              senderPPSN: sender?.ppsn || "unknown",
              senderUserId: sender?.id || userId,
            };
          }),
        );
      } catch (err) {
        throw new ServerError(
          errorKey,
          "failed to create messages from template",
        );
      }

      // Schedule messages
      try {
        const jobs = await messageService.scheduleMessages(
          createdTemplateMessages,
          req.body.scheduledAt,
        );

        eventLogger.log(
          MessagingEventType.scheduleMessage,

          jobs.map((job) => {
            const user = allUsersLookup[job.userId];
            return {
              jobId: job.jobId,
              messageId: job.entityId,
              receiverFullName: `${user.firstName} ${user.lastName}`,
              receiverPPSN: user.ppsn,
              receiverUserId: job.userId,
            };
          }),
        );
      } catch (err) {
        await eventLogger.log(
          MessagingEventType.scheduleMessageError,
          createdTemplateMessages.map((msg) => ({ messageId: msg.messageId })),
        );
        throw err;
      }
    },
  );

  app.get<{ Querystring: { search?: string } }>(
    "/events",
    {
      preValidation: app.verifyUser,
      schema: {
        querystring: Type.Optional(
          Type.Object({
            search: Type.Optional(Type.String()),
          }),
        ),
        response: {
          200: Type.Object({
            data: Type.Array(MessageEventTypeObject),
          }),
        },
      },
    },
    async function getEventsHandler(request, _reply) {
      const textSearchILikeClause = request.query?.search
        ? `%${request.query.search}%`
        : "%%";
      const eventQueryResult = await app.pg.pool.query<MessageEventType>(
        `
        with message_selections as (
          select 
            id,
            subject,
            scheduled_at
          from messages
          where organisation_id = $1
          and lower(subject) ilike $2
          order by created_at
          limit 20
          ) select
              l.message_id as "messageId",
              (l.data ->> 'subject') as subject,
              (l.data ->> 'receiverFullName') as "receiverFullName",
              event_status as "eventStatus",
              event_type as "eventType",
              m.scheduled_at as "scheduledAt"
            from message_selections m
            join messaging_event_logs l on m.id = l.message_id
            order by l.created_at;
        `,
        [organisationId, textSearchILikeClause],
      );

      const aggregations = eventQueryResult.rows.reduce<
        Record<string, MessageEventType>
      >((acc, cur) => {
        if (!acc[cur.messageId]) {
          acc[cur.messageId] = cur;
          return acc;
        }

        for (const key of Object.keys(cur)) {
          const typeKey = key as keyof typeof cur;
          if (cur[typeKey]) {
            acc[cur.messageId][typeKey] = cur[typeKey];
          }
        }

        return acc;
      }, {});

      const data: MessageEventType[] = Object.values(aggregations).sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
      );

      return { data };
    },
  );
}
