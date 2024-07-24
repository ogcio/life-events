import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import {
  getGenericResponseSchema,
  MessageCreate,
  MessageCreateType,
  MessageEvent,
  MessageEventType,
  MessageEventTypeObject,
  PaginationParams,
  PaginationParamsSchema,
  ReadMessageSchema,
  ReadMessagesSchema,
} from "../../types/schemaDefinitions";
import {
  executeJob,
  getMessage,
  getMessages,
} from "../../services/messages/messages";
import { newMessagingService } from "../../services/messages/messaging";
import { getUserProfiles } from "../../services/users/shared-users";
import { Profile } from "building-blocks-sdk";
import { AuthorizationError, NotFoundError, ServerError } from "shared-errors";
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
  app.post<{ Params: { id: string }; Body: { token: string } }>(
    "/jobs/:id",
    {
      schema: {
        body: Type.Object({
          token: Type.String(),
        }),
        response: {
          202: Type.Null(),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async function jobHandler(request, reply) {
      await executeJob({
        pg: app.pg,
        logger: request.log,
        jobId: request.params!.id,
        userId: request.userData?.userId || "",
        token: request.body.token,
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
          200: getGenericResponseSchema(ReadMessagesSchema),
          400: HttpError,
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
          200: getGenericResponseSchema(ReadMessageSchema),
          "4xx": HttpError,
          "5xx": HttpError,
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

  app.post<{ Body: MessageCreateType }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [
          Permissions.Message.Write,
          Permissions.Scheduler.Write,
        ]),
      schema: {
        tags: MESSAGES_TAGS,
        body: MessageCreate,
        response: {
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async function createMessageHandler(request) {
      const errorKey = "FAILED_TO_CREATE_MESSAGE";

      const senderUserId = request.userData?.userId;
      const organisationId = request.userData?.organizationId;

      if (!senderUserId || !organisationId) {
        throw new AuthorizationError(errorKey, "unauthorized");
      }

      const eventLogger = newMessagingEventLogger(app.pg.pool, app.log);

      const receiverUserId = request.body.userId;

      const [receiverUser] = await getUserProfiles(
        [receiverUserId],
        app.pg.pool,
      );

      if (!receiverUser) {
        throw new NotFoundError(
          errorKey,
          "failed to get receiver user profile",
        );
      }

      const profileSdk = new Profile(senderUserId);
      const { data, error } = await profileSdk.selectUsers([senderUserId]);
      if (error) {
        throw new ServerError(
          errorKey,
          "failed to get sender user profile from profile sdk",
        );
      }

      const senderUser = data?.at(0);
      if (!senderUser) {
        throw new NotFoundError(
          errorKey,
          "sender user from profile sdk was undefined",
        );
      }

      const senderFullName =
        `${senderUser.firstName} ${senderUser.lastName}`.trim();
      const receiverFullName =
        `${receiverUser.firstName} ${receiverUser.lastName}`.trim();

      // Create
      const messageService = newMessagingService(app.pg.pool);

      let messageId = "";
      try {
        messageId = await messageService.createMessage({
          receiverUserId,
          ...request.body,
          ...request.body.message,
          organisationId,
        });
      } catch (error) {
        app.log.error({ error });
        throw new ServerError(errorKey, "failed to create message");
      }

      await eventLogger.log(MessagingEventType.createRawMessage, [
        {
          messageId,
          ...request.body,
          ...request.body.message,
          senderFullName,
          senderPPSN: senderUser.ppsn,
          senderUserId,
          receiverFullName,
          receiverPPSN: receiverUser.ppsn,
          receiverUserId,
        },
      ]);

      await eventLogger.log(MessagingEventType.scheduleMessage, [
        { messageId },
      ]);

      // Schedule
      let jobId = "";
      try {
        const [job] = await messageService.scheduleMessages(
          [{ messageId, userId: receiverUserId }],
          request.body.scheduleAt,
          organisationId,
        );
        jobId = job.jobId;
      } catch (err) {
        await eventLogger.log(MessagingEventType.scheduleMessageError, [
          {
            messageId,
            jobId,
          },
        ]);
      }
    },
  );

  // Either we remove this code and re-write it whenever we need to broadcast, or we keep it to quickly get broadcasting going?
  // app.post<{
  //   Body: {
  //     templateMetaId: string;
  //     userIds: string[];
  //     transportations: string[];
  //     security: string;
  //     scheduledAt: string;
  //   };
  // }>(
  //   "/template",
  //   {
  //     preValidation: (req, res) =>
  //       app.checkPermissions(req, res, [Permissions.Template.Write]),
  //     schema: {
  //       body: Type.Object({
  //         templateMetaId: Type.String({ format: "uuid" }),
  //         userIds: Type.Array(Type.String()),
  //         transportations: Type.Array(
  //           Type.Union([
  //             Type.Literal("email"),
  //             Type.Literal("sms"),
  //             Type.Literal("lifeEvent"),
  //           ]),
  //         ),
  //         security: Type.String(),
  //         scheduledAt: Type.String({ format: "date-time" }),
  //       }),
  //       response: {
  //         200: Type.Null(),
  //         "4xx": HttpError,
  //         "5xx": HttpError,
  //       },
  //     },
  //   },
  //   async (req, _res) => {
  //     const userId = req.userData?.userId;
  //     const errorKey = "FAILED_TO_CREATE_MESSAGE_FROM_TEMPLATE";
  //     if (!userId) {
  //       throw new ServerError(errorKey, "no user id on request");
  //     }

  //     if (!req.userData?.organizationId) {
  //       throw new AuthorizationError(
  //         errorKey,
  //         "no organisation id associated to request user",
  //       );
  //     }

  //     const eventLogger = newMessagingEventLogger(app.pg.pool, app.log);

  //     // Get users
  //     const profileSdk = new Profile(req.userData!.userId);
  //     const messageSdk = {
  //       selectUsers(ids: string[]) {
  //         return getUserProfiles(ids, app.pg.pool);
  //       },
  //     };

  //     const profileService = ProfileSdkFacade(profileSdk, messageSdk);
  //     const allUsers = await profileService.selectUsers(req.body.userIds);
  //     const sender = (await profileService.selectUsers([userId])).data?.at(0);

  //     if (allUsers.error) {
  //       throw new ServerError(errorKey, "couldn't fetch user profiles");
  //     }

  //     if (!allUsers.data?.length) {
  //       throw new NotFoundError(errorKey, "no receiver profiles found");
  //     }

  //     // Get template contents
  //     const messageService = newMessagingService(app.pg.pool);

  //     const contents = await messageService.getTemplateContents(
  //       req.body.templateMetaId,
  //     );

  //     if (!contents.length) {
  //       throw new NotFoundError(errorKey, "no template contents found");
  //     }

  //     const allUsersLookup = allUsers.data.reduce<{
  //       [userId: string]: (typeof allUsers.data)[0];
  //     }>((acc, user) => {
  //       acc[user.id] = user;
  //       return acc;
  //     }, {});

  //     // Create messages
  //     let createdTemplateMessages: Awaited<
  //       ReturnType<typeof messageService.createTemplateMessages>
  //     > = [];
  //     try {
  //       createdTemplateMessages = await messageService.createTemplateMessages(
  //         contents,
  //         allUsers.data.map((u) => ({
  //           ...u,
  //           email: u.email || "",
  //           phone: u.phone || "",
  //           userId: u.id,
  //         })),
  //         req.body.transportations,
  //         req.body.security,
  //         req.body.scheduledAt,
  //         req.userData!.organizationId!,
  //       );

  //       await eventLogger.log(
  //         MessagingEventType.createRawMessage,
  //         createdTemplateMessages.map((msg) => {
  //           const user = allUsersLookup[msg.userId];

  //           return {
  //             excerpt: msg.excerpt,
  //             lang: msg.lang,
  //             messageId: msg.messageId,
  //             messageName: "", // message name isn't feature defined at this point
  //             plainText: msg.plainText,
  //             receiverFullName:
  //               `${user.firstName || ""} ${user.lastName || ""}`.trim(),
  //             receiverPPSN: user.ppsn || "",
  //             richText: msg.richText,
  //             subject: msg.subject,
  //             threadName: "", // thread name isn't feature defined at this point
  //             transports: req.body.transportations,
  //             scheduledAt: req.body.scheduledAt,
  //             organisationName: "", // will be derived from jwt once logto is integrated
  //             senderFullName: sender
  //               ? `${sender.firstName || ""} ${sender.lastName || ""}`.trim()
  //               : "",
  //             senderPPSN: sender?.ppsn || "",
  //             senderUserId: sender?.id || userId,
  //           };
  //         }),
  //       );
  //     } catch (err) {
  //       throw new ServerError(
  //         errorKey,
  //         "failed to create messages from template",
  //       );
  //     }

  //     // Schedule messages
  //     try {
  //       const jobs = await messageService.scheduleMessages(
  //         createdTemplateMessages,
  //         req.body.scheduledAt,
  //         req.userData?.organizationId,
  //       );

  //       eventLogger.log(
  //         MessagingEventType.scheduleMessage,

  //         jobs.map((job) => {
  //           const user = allUsersLookup[job.userId];
  //           return {
  //             jobId: job.jobId,
  //             messageId: job.entityId,
  //             receiverFullName: `${user.firstName} ${user.lastName}`,
  //             receiverPPSN: user.ppsn,
  //             receiverUserId: job.userId,
  //           };
  //         }),
  //       );
  //     } catch (err) {
  //       await eventLogger.log(
  //         MessagingEventType.scheduleMessageError,
  //         createdTemplateMessages.map((msg) => ({ messageId: msg.messageId })),
  //       );
  //       throw err;
  //     }
  //   },
  // );

  app.get<{
    Querystring: { search?: string } & PaginationParams;
  }>(
    "/events",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Event.Read]),
      schema: {
        querystring: Type.Optional(
          Type.Composite([
            Type.Object({
              search: Type.Optional(Type.String()),
            }),
            PaginationParamsSchema,
          ]),
        ),
        response: {
          200: getGenericResponseSchema(MessageEventTypeObject),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async function getEventsHandler(request, _reply) {
      const textSearchILikeClause = request.query?.search
        ? `%${request.query.search}%`
        : "%%";
      const eventQueryResult = await app.pg.pool.query<
        MessageEventType["events"][number] & { count: number }
      >(
        `
        with message_count as(
          select count (*) from
          messages where organisation_id = $1
        ), message_selections as (
          select 
            id,
            subject,
            (select * from message_count) as "count",
            scheduled_at
          from messages
          where organisation_id = $1
          and subject ilike $2
          order by scheduled_at desc
          limit $3 offset $4
          ) select
              l.message_id as "messageId",
              m.count::int,
              (l.data ->> 'subject') as subject,
              (l.data ->> 'receiverFullName') as "receiverFullName",
              event_status as "eventStatus",
              event_type as "eventType",
              m.scheduled_at as "scheduledAt"
            from message_selections m
            join messaging_event_logs l on m.id = l.message_id
            order by l.created_at;
        `,
        [
          request.userData?.organizationId,
          textSearchILikeClause,
          request.query.limit,
          request.query.offset,
        ],
      );

      const aggregations = eventQueryResult.rows.reduce<
        Record<string, MessageEventType["events"][number]>
      >((acc, cur) => {
        if (!acc[cur.messageId]) {
          acc[cur.messageId] = cur;
          return acc;
        }

        acc[cur.messageId].eventStatus = cur.eventStatus;
        acc[cur.messageId].eventType = cur.eventType;

        return acc;
      }, {});

      const events: MessageEventType["events"] = Object.values(
        aggregations,
      ).sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
      );

      const data = { events, count: eventQueryResult.rows.at(0)?.count || 0 };

      return { data };
    },
  );

  app.get<{
    Params: {
      messageId: string;
    };
  }>(
    "/:messageId/events",
    {
      schema: {
        response: {
          200: Type.Object({
            data: MessageEvent,
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

      return { data: queryResult.rows };
    },
  );
}
