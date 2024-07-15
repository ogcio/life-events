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
  MessageEventData,
  MessagingEventType,
  newMessagingEventLogger,
} from "../../services/messages/eventLogger";
import { HttpError } from "../../types/httpErrors";
import { Permissions } from "../../types/permissions";

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
  // Didn't add permissions here because
  // we need to manage the scheduler permissions
  // TODO Add a M2M application user to make scheduler able to authenticate
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
        userId: request.userData?.userId || "", // we will require scheduler to callback same creds (jwt?) including the user id caller or include it somewhere else.
        organizationId: request.userData!.organizationId!,
      });

      reply.statusCode = 202;
    },
  );

  // All messages
  app.get<GetAllMessages>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.MessageSelf.Read]),
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
          userId: request.userData!.userId,
          transportType: request.query?.type,
        }),
      };
    },
  );

  // Message by id
  app.get<GetMessage>(
    "/:messageId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.MessageSelf.Read]),
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
          userId: request.userData!.userId,
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
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Message.Write]),
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
      return createMessage({
        payload: request.body,
        pg: app.pg,
        organizationId: request.userData!.organizationId!,
      });
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
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Template.Write]),
      schema: {
        body: Type.Object({
          templateMetaId: Type.String({ format: "uuid" }),
          userIds: Type.Array(Type.String()),
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
        response: {
          200: Type.Null(),
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async (req, _res) => {
      const userId = req.userData?.userId;
      const errorKey = "FAILED_TO_CREATE_MESSAGE_FROM_TEMPLATE";
      if (!userId) {
        throw new ServerError(errorKey, "no user id on request");
      }

      const eventLogger = newMessagingEventLogger(app.pg.pool, app.log);

      // Get users
      const profileSdk = new Profile(req.userData!.userId);
      const messageSdk = {
        selectUsers(ids: string[]) {
          return getUserProfiles(ids, app.pg.pool);
        },
      };

      console.log("hohoohohohohhohohoohho", req.body.userIds);

      const profileService = ProfileSdkFacade(profileSdk, messageSdk);
      const allUsers = await profileService.selectUsers(req.body.userIds);
      const sender = (await profileService.selectUsers([userId])).data?.at(0);

      if (allUsers.error) {
        throw new ServerError(errorKey, "couldn't fetch user profiles");
      }

      if (!allUsers.data?.length) {
        console.log("hitta inga users 2 :(", allUsers.error);
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

      console.log("ALL USERS LALALALA", JSON.stringify(allUsers));

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
          allUsers.data.map((u) => ({
            ...u,
            email: u.email || "",
            phone: u.phone || "",
            userId: u.id,
          })),
          req.body.transportations,
          req.body.security,
          req.body.scheduledAt,
          req.userData!.organizationId!,
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
              receiverPPSN: user.ppsn || "",
              richText: msg.richText,
              subject: msg.subject,
              threadName: "", // thread name isn't feature defined at this point
              transports: req.body.transportations,
              scheduledAt: req.body.scheduledAt,
              organisationName: "", // will be derived from jwt once logto is integrated
              senderFullName: sender
                ? `${sender.firstName} ${sender.lastName}`
                : "",
              senderPPSN: sender?.ppsn || "",
              senderUserId: sender?.id || userId,
            };
          }),
        );
      } catch (err) {
        console.log("Aja...", err);
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
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Event.Read]),
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
          "5xx": HttpError,
          "4xx": HttpError,
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
          and subject ilike $2
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
        [request.userData?.organizationId, textSearchILikeClause],
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

  app.get<{
    Params: {
      messageId: string;
    };
  }>(
    "/events/:messageId",
    {
      schema: {
        response: {
          200: Type.Object({
            data: Type.Array(
              Type.Object({
                eventStatus: Type.String(),
                eventType: Type.String(),
                data: Type.Union([
                  // Create data
                  Type.Object({
                    messageId: Type.String(),
                    receiverFullName: Type.String(),
                    receiverPPSN: Type.String(),
                    subject: Type.String(),
                    lang: Type.String(),
                    excerpt: Type.String(),
                    richText: Type.String(),
                    plainText: Type.String(),
                    threadName: Type.String(),
                    transports: Type.Array(Type.String()),
                    messageName: Type.String(),
                    scheduledAt: Type.String({ format: "date-time" }),
                    senderUserId: Type.String(),
                    senderFullName: Type.String(),
                    senderPPSN: Type.String(),
                    organisationName: Type.String(),
                  }),
                  // Schedule data
                  Type.Object({
                    messageId: Type.String(),
                    jobId: Type.String(),
                  }),
                  // Error data
                  Type.Object({
                    messageId: Type.String(),
                  }),
                ]),
                createdAt: Type.String({ format: "date-time" }),
              }),
            ),
          }),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async function getEventHandler(request, _reply) {
      const messageId = request.params.messageId;
      const queryResult = await app.pg.pool.query<{
        eventStatus: string;
        eventType: string;
        data: MessageEventData;
        createdAt: string;
      }>(
        `
      select 
        event_status as "eventStatus",
        event_type as "eventType",
        data,
        created_at as "createdAt"
      from messaging_event_logs
      where message_id = $1
      order by created_at desc
    `,
        [messageId],
      );

      console.log(queryResult.rows);

      return { data: queryResult.rows };
    },
  );
}
